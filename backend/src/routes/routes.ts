import express from 'express';
import { login, register } from '../controllers/userController';
import authenticationToken from '../middlewares/auth';
import cartRoutes from './cartRoutes';
import categoryRoutes from './categoryRoutes';
import productsRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import wishlistRoutes from './wishlistRoutes';
import recommendationRoutes from './recommendationRoutes';

const router = express.Router();

// 登录路由
router.post('/login', login);

// 注册路由
router.post('/register', register);

router.use('/products', productsRoutes);
router.use('/categories', categoryRoutes);
router.use('/recommendations', recommendationRoutes);

// 保护所有后续路由
router.use(authenticationToken);
router.use('/cart', cartRoutes);

router.use('/order', orderRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;
