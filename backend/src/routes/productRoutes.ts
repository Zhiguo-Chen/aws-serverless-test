import express from 'express';
import productController from '../controllers/productController';
import authenticationToken from '../middlewares/auth';
import { chat } from '../controllers/chatController';

// 解构默认导出的方法
const { createProduct, deleteProduct, updateProduct } = productController;

// 根据环境选择上传策略
import multer from 'multer';
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload =
  process.env.UPLOAD_STRATEGY === 'azure'
    ? require('../services/azureStorage').azureUpload
    : multer({ storage: localStorage });

const router = express.Router();

// 产品相关路由
router.get('/list-all', productController.getProducts);
router.post('/search', productController.searchProductsByStr as any);
router.get('/search/:category', productController.searchByCategory as any);
router.get('/:id', productController.getProductById);

// 需要认证的路由 - 使用 Azure 存储
router.post(
  '/add',
  authenticationToken,
  upload.array('images', 10), // 最多10张图片
  createProduct,
);

router.put(
  '/:id',
  authenticationToken,
  upload.array('images', 10),
  updateProduct,
);

router.delete('/:id', authenticationToken, deleteProduct);

// 聊天相关路由
router.post('/chat', authenticationToken, upload.single('image'), chat);

export default router;
