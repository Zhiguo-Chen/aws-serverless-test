import { Router } from 'express';
import { getProductRecommendations } from '../controllers/recommendationController';

const router = Router();

/**
 * @route   GET /api/recommendations/:productId
 * @desc    Get product recommendations based on a product
 * @access  Public
 */
router.get('/:productId', getProductRecommendations as any);

export default router;
