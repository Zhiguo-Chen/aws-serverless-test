import { Request, Response } from 'express';
import { Wishlist } from '../models/Wishlist.model';
import { Product } from '../models/Product.model';
import { ProductImage } from '../models';

/**
 * Add a product to the current user's wishlist.
 */
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    // @ts-ignore - Assuming `req.user` is populated by the auth middleware
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if the item is already in the wishlist
    const existingEntry = await Wishlist.findOne({
      where: { userId, productId },
    });

    if (existingEntry) {
      return res.status(409).json({ message: 'Product already in wishlist' });
    }

    // Create the new wishlist item
    const wishlistItem = await Wishlist.create({ userId, productId } as any);
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Error adding to wishlist', error });
  }
};

/**
 * Remove a product from the current user's wishlist.
 */
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    const result = await Wishlist.destroy({
      where: { userId, productId },
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    res.status(204).send(); // Successfully deleted, no content to return
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing from wishlist', error });
  }
};

/**
 * Get the current user's complete wishlist with product details.
 */
export const getWishlist = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const wishlistItems = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          // `as` is not needed here because sequelize-typescript handles it
          include: [
            {
              model: ProductImage,
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist', error });
  }
};
