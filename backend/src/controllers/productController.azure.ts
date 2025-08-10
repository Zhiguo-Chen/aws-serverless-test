import { Request, Response } from 'express';
import {
  azureStorageService,
  deleteAzureFiles,
} from '../services/azureStorage';
import { ImageService } from '../services/imageService';
import { Category, Product, ProductImage } from '../models';
import { UploadResult, ImageMeta, ProductImageData } from '../types/azure';

// 创建产品（使用 Azure 存储）
export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      stockQuantity,
      isHotSale,
      imagesMeta,
    } = req.body;

    // 验证必填字段
    if (!name || !price || !categoryId) {
      res.status(400).json({
        error: '产品名称、价格和分类ID是必填项',
      });
      return;
    }

    // 验证分类是否存在
    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(400).json({ error: '分类不存在' });
      return;
    }

    // 处理图片上传
    let productImages: ProductImageData[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      const imagesMetaData: ImageMeta[] = imagesMeta
        ? JSON.parse(imagesMeta)
        : [];

      try {
        // 验证所有图片文件
        for (const file of files) {
          if (!ImageService.validateImageFile(file)) {
            res.status(400).json({
              error: `文件 ${file.originalname} 格式不支持或大小超限`,
            });
            return;
          }
        }

        // 上传到 Azure
        const uploadResults = await azureStorageService.uploadMultiple(files);

        productImages = uploadResults.map(
          (result: UploadResult, index: number) => {
            const metaInfo = imagesMetaData.find(
              (meta: ImageMeta) => meta.name === result.originalName,
            );
            return {
              imageUrl: result.url,
              originalName: result.originalName,
              isPrimary: metaInfo?.isPrimary || false,
              sortOrder: index,
            };
          },
        );

        // 确保只有一个主图
        const primaryImages = productImages.filter((img) => img.isPrimary);
        if (primaryImages.length === 0 && productImages.length > 0) {
          productImages[0].isPrimary = true;
        } else if (primaryImages.length > 1) {
          productImages.forEach((img, index) => {
            img.isPrimary =
              index === productImages.findIndex((p) => p.isPrimary);
          });
        }
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError);
        res.status(500).json({ error: '图片上传失败' });
        return;
      }
    }

    // 创建产品
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      originalPrice: parseFloat(price), // 默认原价等于当前价格
      categoryId: parseInt(categoryId),
      stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
      isHotSale: isHotSale === 'true',
    });

    // 创建产品图片记录
    if (productImages.length > 0) {
      const imageRecords = productImages.map((img) => ({
        productId: product.id,
        imageUrl: img.imageUrl,
        altText: img.originalName,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      }));

      await ProductImage.bulkCreate(imageRecords);
    }

    // 获取完整的产品信息
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'productImages' },
      ],
    });

    res.status(201).json({
      message: '产品创建成功',
      product: createdProduct,
    });
  } catch (error) {
    console.error('创建产品失败:', error);
    res.status(500).json({ error: '创建产品失败' });
  }
};

// 更新产品（使用 Azure 存储）
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      stockQuantity,
      isHotSale,
      imagesMetaJson,
      imagesToDelete,
    } = req.body;

    // 查找产品
    const product = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: 'productImages' }],
    });

    if (!product) {
      res.status(404).json({ error: '产品不存在' });
      return;
    }

    // 验证分类
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        res.status(400).json({ error: '分类不存在' });
        return;
      }
    }

    // 处理要删除的图片
    if (imagesToDelete) {
      const deleteIds = JSON.parse(imagesToDelete);
      const imagesToDeleteRecords = await ProductImage.findAll({
        where: { id: deleteIds, productId: id },
      });

      if (imagesToDeleteRecords.length > 0) {
        const urlsToDelete = imagesToDeleteRecords.map((img) => img.imageUrl);

        // 从 Azure 删除文件
        await deleteAzureFiles(urlsToDelete);

        // 从数据库删除记录
        await ProductImage.destroy({
          where: { id: deleteIds, productId: id },
        });
      }
    }

    // 处理新上传的图片
    const imagesMeta: ImageMeta[] = imagesMetaJson
      ? JSON.parse(imagesMetaJson)
      : [];
    const newFiles = (req.files as Express.Multer.File[]) || [];

    if (newFiles.length > 0) {
      try {
        // 验证文件
        for (const file of newFiles) {
          if (!ImageService.validateImageFile(file)) {
            res.status(400).json({
              error: `文件 ${file.originalname} 格式不支持或大小超限`,
            });
            return;
          }
        }

        // 上传到 Azure
        const uploadResults = await azureStorageService.uploadMultiple(
          newFiles,
        );

        const newImageRecords = uploadResults.map(
          (result: UploadResult, index: number) => {
            const meta = imagesMeta.find(
              (m: ImageMeta) => m.name === result.originalName,
            );
            return {
              productId: product.id,
              imageUrl: result.url,
              altText: result.originalName,
              isPrimary: meta ? meta.isPrimary : false,
              sortOrder: index,
            };
          },
        );

        await ProductImage.bulkCreate(newImageRecords);
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError);
        res.status(500).json({ error: '图片上传失败' });
        return;
      }
    }

    // 更新图片的 isPrimary 状态
    if (imagesMeta.length > 0) {
      const allImages = await ProductImage.findAll({
        where: { productId: id },
      });

      for (const image of allImages) {
        const meta = imagesMeta.find(
          (m: ImageMeta) =>
            m.name === image.altText || image.imageUrl.includes(m.name),
        );
        if (meta && image.isPrimary !== meta.isPrimary) {
          await image.update({ isPrimary: meta.isPrimary });
        }
      }
    }

    // 更新产品信息
    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
      stockQuantity:
        stockQuantity !== undefined
          ? parseInt(stockQuantity)
          : product.stockQuantity,
      isHotSale:
        isHotSale !== undefined ? isHotSale === 'true' : product.isHotSale,
    });

    // 获取更新后的产品信息
    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'productImages' },
      ],
    });

    res.json({
      message: '产品更新成功',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('更新产品失败:', error);
    res.status(500).json({ error: '更新产品失败' });
  }
};

// 删除产品（清理 Azure 文件）
export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: 'productImages' }],
    });

    if (!product) {
      res.status(404).json({ error: '产品不存在' });
      return;
    }

    // 删除 Azure 中的图片文件
    if (product.productImages && product.productImages.length > 0) {
      const imageUrls = product.productImages.map((img: any) => img.imageUrl);
      await deleteAzureFiles(imageUrls);
    }

    // 删除数据库记录（级联删除会自动删除相关的图片记录）
    await product.destroy();

    res.json({ message: '产品删除成功' });
  } catch (error) {
    console.error('删除产品失败:', error);
    res.status(500).json({ error: '删除产品失败' });
  }
};
