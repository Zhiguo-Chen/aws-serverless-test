import { Request, Response } from 'express';
import { Order } from '../models/Order.model';
import { Cart } from '../models/Cart.model';
import { CartItem } from '../models/CartItem.model';
import { User } from '../models/User.model';
import { Product } from '../models/Product.model';

// 创建订单（支持选择部分 cartItem 结算）
export const createOrder = async (req: Request | any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { paymentMethod, cartItemIds } = req.body;
    if (!userId || !paymentMethod || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // 查询指定 cartItem
    const cartItems = await CartItem.findAll({
      where: {
        id: cartItemIds,
        orderId: null, // 只结算未下单的
      },
      include: [Product],
    });
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'No valid cart items found' });
    }
    // 计算总价
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * (item.product as any).price), 0);
    // 创建订单
    const order = await Order.create({
      userId,
      paymentMethod,
      totalAmount,
      status: 'pending',
    });
    // 关联 cartItems 到 order
    await Promise.all(
      cartItems.map(async (item) => {
        item.orderId = order.id;
        await item.save();
      })
    );
    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询订单列表
export const listOrders = async (req: Request | any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'cartItems',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
