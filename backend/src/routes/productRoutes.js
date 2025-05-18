// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { register, login } = require('../controllers/userController');
const authenticationToken = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const categoryRoutes = require('./categoryRoutes');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// 登录路由
router.post('/login', login);

// 在适当位置添加
router.use('/categories', categoryRoutes);

// 保护所有后续路由
router.use(authenticationToken);

// 产品管理路由
router.post(
  '/products',
  upload.single('image'),
  productController.createProduct,
);
router.put(
  '/products/:id',
  upload.single('image'),
  productController.updateProduct,
);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
