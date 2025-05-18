const express = require('express');
const { register, login } = require('../controllers/userController');
const authenticationToken = require('../middlewares/auth');
const { listAllCategory } = require('../controllers/categoryController');
const {
  addProduct,
  getAllProducts,
  getProductsByUser,
} = require('../controllers/productController_bk');

const router = express.Router();

router.use('/test', (req, res) => {
  res.json({ id: 1, name: 'Leo Messi' });
});

router.use('/register', register);
router.use('/login', login);
router.use('/add-product', authenticationToken, addProduct);
router.use('/get-products', authenticationToken, getAllProducts);
router.use('/get-my-products', authenticationToken, getProductsByUser);
router.use('/get-categories', authenticationToken, listAllCategory);

module.exports = router;
