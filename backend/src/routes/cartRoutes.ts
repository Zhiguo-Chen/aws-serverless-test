import express from 'express';
import {
  addToCart,
  listItemsInCart,
  removeFromCart,
  updateCartItem,
} from '../controllers/cartController';

const router = express.Router();

router.post('/add', addToCart);
router.get('/list-all', listItemsInCart);
router.put('/update/:id', updateCartItem);
router.delete('/delete/:id', removeFromCart);

export default router;
