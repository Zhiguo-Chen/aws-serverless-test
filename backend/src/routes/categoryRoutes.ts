import express from 'express';
import {
  getAllCategories,
  createCategory,
} from '../controllers/categoryController';
import authenticationToken from '../middlewares/auth';

const router = express.Router();

// 公开路由
router.get('/', getAllCategories);

// 需要认证的路由
router.post('/', authenticationToken, createCategory);

export default router;
