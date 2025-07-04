import { Request, Response } from 'express';
import { getRecommendationsForProduct } from '../services/recommendation.service';

/**
 * Controller to get product recommendations based on a given product ID.
 */
export const getProductRecommendations = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const recommendations = await getRecommendationsForProduct(productId);

    if (recommendations.length === 0) {
      return res
        .status(200)
        .json({ message: 'No recommendations found for this product.' });
    }

    res.status(200).json(recommendations);
  } catch (error: any) {
    console.error('Error getting product recommendations:', error);
    // Check for specific errors from the service
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
};
