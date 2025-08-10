import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ImageUploadResult, ImageUploadService } from './imageService';

// 类型守卫：检查是否为 Azure 错误
function isAzureError(
  error: unknown,
): error is { code: string; message: string } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

// Azure Blob Storage 配置
class AzureStorageService implements ImageUploadService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  private sharedKeyCredential: StorageSharedKeyCredential;
  private accountName: string;

  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
    this.containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'product-images';

    // 创建认证凭据
    this.sharedKeyCredential = new StorageSharedKeyCredential(
      this.accountName,
      accountKey,
    );

    // 创建 BlobServiceClient
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      this.sharedKeyCredential,
    );

    this.initializeContainer();
  }

  // 初始化容器
  private async initializeContainer() {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );

      // 根据配置决定是否设置公共访问
      const useSasUrls = process.env.AZURE_USE_SAS_URLS === 'true';

      if (useSasUrls) {
        // 使用 SAS 令牌，创建私有容器
        await containerClient.createIfNotExists();
        console.log(
          `Azure容器 "${this.containerName}" 已创建为私有容器（使用SAS访问）`,
        );
      } else {
        // 尝试创建公共访问容器
        try {
          await containerClient.createIfNotExists({
            access: 'blob', // 公共读取访问
          });
          console.log(`Azure容器 "${this.containerName}" 已创建为公共容器`);
        } catch (publicError) {
          // 如果公共访问失败，创建私有容器并提示
          await containerClient.createIfNotExists();
          console.log(`Azure容器 "${this.containerName}" 已创建为私有容器`);
          console.warn(
            '⚠️  容器创建为私有访问，请手动设置容器为公共访问或启用SAS令牌',
          );
        }
      }
    } catch (error) {
      console.error('初始化Azure容器失败:', error);

      // 如果是公共访问权限错误，尝试创建私有容器
      if (isAzureError(error) && error.code === 'PublicAccessNotPermitted') {
        try {
          const containerClient = this.blobServiceClient.getContainerClient(
            this.containerName,
          );
          await containerClient.createIfNotExists();
          console.log(`Azure容器 "${this.containerName}" 已创建为私有容器`);
          console.warn(
            '⚠️  存储账户不允许公共访问，请启用SAS令牌或手动设置容器访问级别',
          );
        } catch (retryError) {
          console.error('重试创建容器失败:', retryError);
        }
      }
    }
  }

  // 上传单个文件
  async uploadSingle(file: Express.Multer.File): Promise<ImageUploadResult> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );

      // 生成唯一文件名
      const fileName = this.generateFileName(file.originalname);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      // 上传文件
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
          blobCacheControl: 'public, max-age=31536000', // 1年缓存
        },
        metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
        },
      });

      // 生成带 SAS 令牌的 URL 用于公共访问
      const sasUrl = this.generateSasUrl(fileName);

      return {
        url: sasUrl,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      console.error('Azure上传失败:', error);
      throw new Error(
        `文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  // 上传多个文件
  async uploadMultiple(
    files: Express.Multer.File[],
  ): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadSingle(file));
    return Promise.all(uploadPromises);
  }

  // 删除文件
  async delete(url: string): Promise<boolean> {
    try {
      const fileName = this.extractFileNameFromUrl(url);
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      await blockBlobClient.deleteIfExists();
      return true;
    } catch (error) {
      console.error('Azure删除文件失败:', error);
      return false;
    }
  }

  // 生成文件名
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = originalName.split('.').pop();
    return `products/${timestamp}-${uuid}.${extension}`;
  }

  // 从URL提取文件名
  private extractFileNameFromUrl(url: string): string {
    // 移除 SAS 参数
    const urlWithoutSas = url.split('?')[0];
    const urlParts = urlWithoutSas.split('/');
    return urlParts.slice(-2).join('/'); // 获取 "products/filename.ext"
  }

  // 生成带 SAS 令牌的 URL
  private generateSasUrl(fileName: string): string {
    const useSasUrls = process.env.AZURE_USE_SAS_URLS === 'true';

    if (!useSasUrls) {
      // 返回公共 URL（需要容器设置为公共访问）
      return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${fileName}`;
    }

    try {
      // 获取 SAS 令牌有效期（默认1年）
      const expiryHours = parseInt(
        process.env.AZURE_SAS_EXPIRY_HOURS || '8760',
      );
      const expiryDate = new Date(
        new Date().valueOf() + expiryHours * 60 * 60 * 1000,
      );

      // 生成 SAS 令牌
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName: fileName,
          permissions: BlobSASPermissions.parse('r'), // 只读权限
          startsOn: new Date(),
          expiresOn: expiryDate,
        },
        this.sharedKeyCredential,
      );

      // 构建完整的 SAS URL
      return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${fileName}?${sasToken}`;
    } catch (error) {
      console.error('生成 SAS URL 失败:', error);
      // 如果 SAS 生成失败，返回基本 URL
      return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${fileName}`;
    }
  }
}

// 创建 Azure 存储服务实例（仅在需要时）
export const azureStorageService =
  process.env.UPLOAD_STRATEGY === 'azure'
    ? new AzureStorageService()
    : ({
        upload: async () => {
          throw new Error('Azure storage not configured');
        },
        delete: async () => {
          throw new Error('Azure storage not configured');
        },
        getPublicUrl: () => {
          throw new Error('Azure storage not configured');
        },
      } as any);

// Multer 内存存储配置（用于 Azure）
const memoryStorage = multer.memoryStorage();

export const azureUpload = multer({
  storage: memoryStorage,
  fileFilter: (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    // 验证文件类型
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // 使用类型断言来处理 Multer 的类型问题
      cb(new Error('只允许上传图片文件') as any, false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
    files: 10, // 最多10个文件
  },
});

// 批量删除 Azure 文件
export const deleteAzureFiles = async (urls: string[]): Promise<boolean[]> => {
  const deletePromises = urls.map((url) => azureStorageService.delete(url));
  return Promise.all(deletePromises);
};
