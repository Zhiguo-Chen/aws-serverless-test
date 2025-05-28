import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { chat } from '../controllers/chatController.js';
import productController from '../controllers/productController.js';
import { login, register } from '../controllers/userController.js';
import authenticationToken from '../middlewares/auth.js';
import categoryRoutes from './categoryRoutes.js';

const router = express.Router();
const uploadDir = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '../public/uploads',
);
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

// 注册路由
router.post('/register', register);

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
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.put(
  '/products/:id',
  upload.single('image'),
  productController.updateProduct,
);
router.delete('/products/:id', productController.deleteProduct);

// 聊天相关路由
router.post('/chat', upload.single('image'), chat);

export default router;
