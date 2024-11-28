const { Category } = require('../models');

const listAllCategory = async (req, res) => {
  try {
    const category = await Category.findAll();
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listAllCategory,
};
