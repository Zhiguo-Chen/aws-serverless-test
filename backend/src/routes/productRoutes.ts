import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { chat } from '../controllers/chatController';
import productController from '../controllers/productController';
import { login, register } from '../controllers/userController';
import authenticationToken from '../middlewares/auth';
import categoryRoutes from './categoryRoutes';

const router = express.Router();
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

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Maximum 10 files
  },
});

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
  upload.array('images', 10), // 最多10张图片
  productController.createProduct,
);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.put(
  '/products/:id',
  upload.array('images', 10),
  productController.updateProduct,
);
router.delete('/products/:id', productController.deleteProduct);

// 聊天相关路由
router.post('/chat', upload.single('image'), chat);

export default router;
