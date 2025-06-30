import { CartItem } from '../models/CartItem.model';
import { Cart } from '../models/Cart.model';
import { Request, Response } from 'express';
import { Product, ProductImage } from '../models';

export const addToCart = async (req: Request | any, res: Response) => {
  try {
    const { productId, quantity } = req.body as any;
    const userId = req.user?.id as any;

    if (!userId || !productId || !quantity) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // 查找用户的购物车
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      // 没有则创建
      cart = await Cart.create({ userId });
    }

    // 创建购物车项
    const cartItem = await CartItem.create({
      cartId: cart.id,
      productId,
      quantity,
    });

    res.status(201).json({ cartItem });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const listItemsInCart = async (req: Request | any, res: Response) => {
  try {
    const userId = req.user?.id as any;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: ProductImage, // Assuming Product has a User association
                  as: 'productImages',
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCartItem = async (req: Request | any, res: Response) => {
  try {
    const { itemId, quantity } = req.body as any;
    const userId = req.user?.id as any;

    if (!userId || !itemId || quantity === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cart: { userId } },
    });

    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ cartItem });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromCart = async (req: Request | any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id as any;

    if (!userId || !id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const cartItem = await CartItem.findOne({
      where: { id },
    });

    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await cartItem.destroy();

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
