import express from 'express';
import { login, register } from '../controllers/userController';
import authenticationToken from '../middlewares/auth';
import cartRoutes from './cartRoutes';
import categoryRoutes from './categoryRoutes';
import productsRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import wishlistRoutes from './wishlistRoutes';
import { createProxyMiddleware } from 'http-proxy-middleware';
import recommendationRoutes from './recommendationRoutes';

const router = express.Router();

// Chat service proxy
router.use('/chat', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/chat', // Rewrite root to /chat
  },
}));

// Login route
router.post('/login', login);


// Register route
router.post('/register', register);

router.use('/products', productsRoutes);
router.use('/categories', categoryRoutes);
router.use('/recommendations', recommendationRoutes);

// Protect all subsequent routes
router.use(authenticationToken);
router.use('/cart', cartRoutes);

router.use('/order', orderRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;
