import { Router } from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '../controllers/wishlistController';
import authenticationToken from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/', getWishlist);

/**
 * @route   POST /api/wishlist
 * @desc    Add a product to wishlist
 * @access  Private
 */
router.post('/', addToWishlist as any);

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove a product from wishlist
 * @access  Private
 */
router.delete('/:productId', removeFromWishlist as any);

export default router;
