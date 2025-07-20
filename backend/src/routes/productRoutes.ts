import express from 'express';
import productController from '../controllers/productController';
import { azureUpload } from '../services/azureStorage';
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '../controllers/productController.azure';
import authenticationToken from '../middlewares/auth';
import { chat } from '../controllers/chatController';

const router = express.Router();

// 使用 Azure 存储上传
const upload = azureUpload;

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
