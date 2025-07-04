import { Request, Response } from 'express';
import sequelize, { Category, Product, ProductImage } from '../models';
import * as fs from 'fs';
import * as path from 'path';
import { searchProducts } from '../services/search-products-service';
import { Op } from 'sequelize';

const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      stockQuantity,
      isFeatured,
      isHotSale,
      isNewArrival,
      isFlashSale,
      flashSaleEndsAt,
      imagesMeta,
    } = req.body;

    const categoryRecord = await Category.findOne({
      where: { name: category },
      raw: true,
    });

    if (!categoryRecord) {
      res.status(400).json({ error: 'Category not found' });
      return;
    }

    let productImages: any[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      const imagesMetaData = imagesMeta ? JSON.parse(imagesMeta) : [];

      productImages = files.map((file, index) => {
        const metaInfo = imagesMetaData.find(
          (meta: any) => meta.name === file.originalname,
        );
        return {
          imageUrl: `/uploads/${file.filename}`,
          originalName: file.originalname,
          isPrimary: metaInfo?.isPrimary || false,
          sortOrder: index,
        };
      });

      // 确保只有一张主图
      const primaryImages = productImages.filter((img) => img.isPrimary);
      if (primaryImages.length === 0 && productImages.length > 0) {
        productImages[0].isPrimary = true;
      } else if (primaryImages.length > 1) {
        // 如果有多张主图，只保留第一张为主图
        productImages.forEach((img, index) => {
          img.isPrimary = index === productImages.findIndex((p) => p.isPrimary);
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      discountPercentage: originalPrice
        ? Math.round((1 - price / originalPrice) * 100)
        : 0,
      categoryId: categoryRecord.id, // 明确设置 categoryId
      stockQuantity,
      isFeatured,
      isNewArrival,
      isHotSale,
      isFlashSale,
      flashSaleEndsAt,
      imageUrl:
        productImages.find((img) => img.isPrimary)?.imageUrl ||
        productImages[0]?.imageUrl ||
        null,
    });

    if (productImages.length > 0) {
      const imageRecords = productImages.map((img) => ({
        productId: product.id,
        imageUrl: img.imageUrl,
        altText: img.originalName || name || '',
        isPrimary: img.isPrimary,
      }));

      await ProductImage.bulkCreate(imageRecords);
    }

    res.status(201).json(product);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const {
      imagesMeta: imagesMetaJson,
      deletedImageIds: deletedImageIdsJson,
      category: categoryName,
      ...otherUpdates
    } = req.body;

    const product = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: 'productImages' }],
      transaction,
    });

    if (!product) {
      await transaction.rollback();
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // 1. Delete images marked for deletion
    if (deletedImageIdsJson) {
      const deletedImageIds = JSON.parse(deletedImageIdsJson);
      if (Array.isArray(deletedImageIds) && deletedImageIds.length > 0) {
        const imagesToDelete = await ProductImage.findAll({
          where: { id: deletedImageIds },
          transaction,
        });

        for (const image of imagesToDelete) {
          if (image.imageUrl) {
            const imagePath = path.join(
              __dirname,
              '..',
              'public',
              image.imageUrl.substring(1),
            );
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
        }

        await ProductImage.destroy({
          where: { id: deletedImageIds },
          transaction,
        });
      }
    }

    // 2. Process new and existing images
    const imagesMeta = imagesMetaJson ? JSON.parse(imagesMetaJson) : [];
    const newFiles = (req.files as Express.Multer.File[]) || [];

    // Update isPrimary for all images based on imagesMeta
    const allImages = product.productImages || [];
    for (const image of allImages) {
      const meta = imagesMeta.find((m: any) => m.id === image.id);
      const isPrimary = meta ? meta.isPrimary : false;
      if (image.isPrimary !== isPrimary) {
        await image.update({ isPrimary }, { transaction });
      }
    }

    // Create new images
    if (newFiles.length > 0) {
      const newImagesMeta = imagesMeta.filter((m: any) => m.isNew);
      const newProductImages = newFiles.map((file) => {
        const meta = newImagesMeta.find(
          (m: any) => m.fileName === file.originalname,
        );
        return {
          productId: product.id,
          imageUrl: `/uploads/${file.filename}`,
          altText: file.originalname,
          isPrimary: meta ? meta.isPrimary : false,
        };
      });
      await ProductImage.bulkCreate(newProductImages, { transaction });
    }

    // 3. Update other product attributes
    const updates: { [key: string]: any } = { ...otherUpdates };
    if (categoryName) {
      const category = await Category.findOne({
        where: { name: categoryName },
        transaction,
      });
      if (category) {
        updates.categoryId = category.id;
      } else {
        await transaction.rollback();
        res.status(400).json({ error: 'Category not found' });
      }
    }

    if (updates.price !== undefined || updates.originalPrice !== undefined) {
      const price =
        updates.price !== undefined ? parseFloat(updates.price) : product.price;
      const originalPrice =
        updates.originalPrice !== undefined
          ? parseFloat(updates.originalPrice)
          : product.originalPrice;
      updates.discountPercentage = originalPrice
        ? Math.round((1 - price / originalPrice) * 100)
        : 0;
    }

    // 4. Set primary image URL on product
    const finalImages = product.productImages || [];

    const primaryImage = finalImages.find((img) => img.isPrimary);
    updates.imageUrl = primaryImage
      ? primaryImage.imageUrl
      : finalImages[0]?.imageUrl || null;

    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key],
    );

    await product.update(updates, { transaction });

    await transaction.commit();

    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'productImages' },
      ],
    });

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    await transaction.rollback();
    console.error('Update Product Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ProductImage,
          as: 'productImages', // 确保和你的关联别名一致
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'createdAt'],
        },
      ],
      attributes: {
        include: [
          // 评分数量
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
            ),
            'reviewCount',
          ],
          // 平均评分
          [
            sequelize.literal(
              '(SELECT AVG(rating) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
            ),
            'averageRating',
          ],
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    // 格式化平均评分
    const formattedProducts = products.map((product) => {
      const productJson = product.toJSON();
      productJson.averageRating = productJson.averageRating
        ? parseFloat(productJson.averageRating).toFixed(1)
        : 0;
      return productJson;
    });

    res.status(200).json(formattedProducts);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ProductImage,
          as: 'productImages', // 确保和你的关联别名一致
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'createdAt'],
        },
      ],
      attributes: {
        include: [
          // 评分数量
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
            ),
            'reviewCount',
          ],
          // 平均评分
          [
            sequelize.literal(
              '(SELECT AVG(rating) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
            ),
            'averageRating',
          ],
        ],
      },
    });

    if (product) {
      const productData = product.toJSON();

      // 格式化平均评分
      productData.averageRating = productData.averageRating
        ? parseFloat(productData.averageRating).toFixed(1)
        : 0;

      // 计算评分分布
      if (productData.Reviews && productData.Reviews.length > 0) {
        productData.ratingDistribution = [0, 0, 0, 0, 0]; // 1-5星的计数
        productData.Reviews.forEach((review: any) => {
          if (review.rating >= 1 && review.rating <= 5) {
            productData.ratingDistribution[review.rating - 1]++;
          }
        });
      }

      res.status(200).json(productData);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const rawProduct = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: 'productImages' }],
      transaction,
    });

    const product = rawProduct?.toJSON();

    if (!product) {
      await transaction.rollback();
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // 删除所有附属图片文件
    const images = product.productImages || [];
    for (const image of images) {
      if (image.imageUrl) {
        // const imagePath = path.join(__dirname, '../../public', image.imageUrl);
        const relativePath = image.imageUrl.replace(/^\/+/, '');
        const imagePath = path.join(process.cwd(), 'public', relativePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // 删除所有附属图片数据库记录
    await ProductImage.destroy({
      where: { productId: product.id },
      transaction,
    });

    // 删除产品本身
    if (rawProduct) {
      await rawProduct.destroy({ transaction });
    }

    await transaction.commit();
    res.status(204).end();
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};

const searchProductsByStr = async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  try {
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: Category,
          as: 'category',
          where: {
            name: { [Op.iLike]: `%${query}%` },
          },
          required: false,
        },
        {
          model: ProductImage,
          as: 'productImages',
        },
      ],
      attributes: {
        include: [
          // 评分数量
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
            ),
            'reviewCount',
          ],
          // 平均评分
          [
            sequelize.literal(
              '(SELECT AVG(rating) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
            ),
            'averageRating',
          ],
        ],
      },
    });

    res.status(200).json(products);
  } catch (error: any) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: error.message });
  }
};

const searchByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category parameter is required' });
  }
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          where: {
            name: { [Op.iLike]: `%${category}%` },
          },
        },
        {
          model: ProductImage,
          as: 'productImages',
        },
      ],
      attributes: {
        include: [
          // 评分数量
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
            ),
            'reviewCount',
          ],
          // 平均评分
          [
            sequelize.literal(
              '(SELECT AVG(rating) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
            ),
            'averageRating',
          ],
        ],
      },
    });

    res.status(200).json(products);
  } catch (error: any) {
    console.error('Error searching products by category:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  deleteProduct,
  searchProductsByStr,
  searchByCategory,
};
