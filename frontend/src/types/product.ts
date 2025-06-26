import { Category } from './category';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  reviewCount: number;
  averageRating: number;
  discountPercentage: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  isBestSelling?: boolean;
  isExplored?: boolean;
  isSpecialPromotional?: boolean;
  stockQuantity: number;
  flashSaleEndsAt?: Date;
  primaryImageUrl?: string;
  productImages: Array<ProductImage>;
  categoryId?: number;
  category?: Category;
}

export interface ProductImage {
  id: string;
  isPrimary: boolean;
  altText: string;
  imageUrl: string;
  productId?: string;
}
