const { Product } = require('../models');

const addProduct = async (req, res) => {
  try {
    const { name, price, description, stock, image, category_id } = req.body;
    const newProduct = new Product({
      name,
      price,
      description,
      stock,
      image,
      category_id,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
};
