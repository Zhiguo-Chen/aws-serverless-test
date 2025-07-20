import { Request } from 'express';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// 图片处理服务
export class ImageService {
  // 图片压缩和优化
  static async processImage(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {},
  ): Promise<Buffer> {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg',
    } = options;

    return await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();
  }

  // 生成多种尺寸的图片
  static async generateThumbnails(buffer: Buffer): Promise<{
    thumbnail: Buffer;
    medium: Buffer;
    large: Buffer;
  }> {
    const [thumbnail, medium, large] = await Promise.all([
      this.processImage(buffer, { width: 150, height: 150 }),
      this.processImage(buffer, { width: 400, height: 400 }),
      this.processImage(buffer, { width: 800, height: 800 }),
    ]);

    return { thumbnail, medium, large };
  }

  // 验证图片格式
  static validateImageFile(file: Express.Multer.File): boolean {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return allowedMimes.includes(file.mimetype) && file.size <= maxSize;
  }
}

// 统一的图片上传接口
export interface ImageUploadResult {
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface ImageUploadService {
  uploadSingle(file: Express.Multer.File): Promise<ImageUploadResult>;
  uploadMultiple(files: Express.Multer.File[]): Promise<ImageUploadResult[]>;
  delete(url: string): Promise<boolean>;
}
