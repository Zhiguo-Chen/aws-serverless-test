// backend/controllers/productController.js
const { Product, Category, sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      stockQuantity,
      isFeatured,
      isNewArrival,
      isFlashSale,
      flashSaleEndsAt,
    } = req.body;
    console.log('++++++++++++++++');
    console.log(req.body.category);
    console.log('++++++++++++++++');

    const categoryRecord = await Category.findOne({
      where: { name: category },
    });

    if (!categoryRecord) {
      return res.status(400).json({ error: 'Category not found' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
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
      isFlashSale,
      flashSaleEndsAt,
      imageUrl,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.originalPrice || updates.price) {
      updates.discountPercentage = updates.originalPrice
        ? Math.round((1 - updates.price / updates.originalPrice) * 100)
        : 0;
    }

    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
      // 删除旧图片
      const product = await Product.findByPk(id);
      if (product.imageUrl) {
        const oldImagePath = path.join(
          __dirname,
          '../public',
          product.imageUrl,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const [updated] = await Product.update(updates, {
      where: { id },
    });

    if (updated) {
      const updatedProduct = await Product.findByPk(id);
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'Category',
          attributes: ['id', 'name'],
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
      order: [['createdAt', 'DESC']],
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'Category',
          attributes: ['id', 'name'],
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
        productData.Reviews.forEach((review) => {
          if (review.rating >= 1 && review.rating <= 5) {
            productData.ratingDistribution[review.rating - 1]++;
          }
        });
      }

      res.status(200).json(productData);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (product) {
      // 删除关联的图片
      if (product.imageUrl) {
        const imagePath = path.join(__dirname, '../public', product.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await product.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
