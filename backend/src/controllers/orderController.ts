import { Request, Response } from 'express';
import { MongoOrder } from '../models/Order.mongo'; // Import the new Mongoose model
import { CartItem } from '../models/CartItem.model';
import { Product } from '../models/Product.model';
import { IOrderProduct } from '../models/Order.mongo';
import { ProductImage } from '../models';

// Create an order from cart items and store it in MongoDB
export const createOrder = async (req: Request | any, res: Response) => {
  try {
    const userId = req.user?.id;
    // Assuming shippingAddress is provided in the request body
    const { paymentMethod, cartItemIds, shippingAddress } = req.body;

    if (
      !userId ||
      !paymentMethod ||
      !shippingAddress ||
      !Array.isArray(cartItemIds) ||
      cartItemIds.length === 0
    ) {
      res
        .status(400)
        .json({ error: 'Missing required fields, including shippingAddress.' });
      return;
    }

    // 1. Find the selected cart items from the relational database
    const cartItemsRaw = await CartItem.findAll({
      where: {
        id: cartItemIds,
        orderId: null,
      },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: ProductImage,
              as: 'productImages',
            },
          ],
        },
      ],
    });
    // Convert to plain object
    const cartItems = cartItemsRaw.map((item) => item.toJSON());

    if (!cartItems || cartItems.length === 0) {
      res.status(404).json({ error: 'No valid cart items found.' });
      return;
    }

    // 2. Create product snapshots and calculate total amount
    const productSnapshots: IOrderProduct[] = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      if (!item.product) {
        // Handle case where a product might have been deleted
        res
          .status(400)
          .json({ error: `Product with ID ${item.productId} not found.` });
        return;
      }
      let primaryImageUrl = '';
      if (item.product.productImages?.length) {
        primaryImageUrl =
          item.product.productImages.find((img: any) => img.isPrimary)
            ?.imageUrl || item.product.productImages[0].imageUrl;
      }
      const productSnapshot: IOrderProduct = {
        productId: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        originalPrice: item.product.originalPrice,
        imageUrl: primaryImageUrl,
        quantity: item.quantity,
      };
      productSnapshots.push(productSnapshot);
      totalAmount += item.product.price * item.quantity;
    }

    // 3. Create the new order in MongoDB
    const newOrder = new MongoOrder({
      userId,
      products: productSnapshots,
      totalAmount,
      paymentMethod,
      shippingAddress,
      status: 'Pending', // Initial status
    });

    await newOrder.save();

    // 4. (Important) Clean up: Delete the cart items from the relational DB
    const idsToDelete = cartItems.map((item) => item.id);
    await CartItem.destroy({
      where: {
        id: idsToDelete,
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// List all orders for the authenticated user from MongoDB
export const listOrders = async (req: Request | any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const orders = await MongoOrder.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Failed to list orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single order by its MongoDB ObjectId
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const order = await MongoOrder.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Failed to get order by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const order = await MongoOrder.findOneAndDelete({ _id: orderId, userId });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Failed to delete order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
