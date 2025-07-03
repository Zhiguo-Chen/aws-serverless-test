import express from 'express';
import { createOrder, deleteOrder, listOrders } from '../controllers/orderController';

const router = express.Router();

router.post('/new', createOrder);
router.get('/list', listOrders);
router.delete('/:orderId', deleteOrder); 

export default router;