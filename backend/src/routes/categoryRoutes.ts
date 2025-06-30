import express from 'express';
import {
  getAllCategories,
  createCategory,
} from '../controllers/categoryController';
import authenticationToken from '../middlewares/auth';

const router = express.Router();

router.get('/', getAllCategories);

router.post('/', authenticationToken, createCategory);

export default router;
