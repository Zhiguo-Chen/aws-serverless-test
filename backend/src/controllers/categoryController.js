const { Category } = require('../models');

exports.listAllCategory = async (req, res) => {
  try {
    const category = await Category.findAll();
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'slug', 'imageUrl'],
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// module.exports = {
//   listAllCategory,
// };
