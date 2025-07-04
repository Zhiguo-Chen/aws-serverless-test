import { API_URL } from '../const/API_URL';
import { Product } from '../types/product';

export const processProduct = (products: Product[]) => {
  if (!Array.isArray(products) || !products || products.length === 0) {
    return [];
  }
  return products.map((prd: Product) => {
    const primaryImage = prd.productImages.find((img) => img.isPrimary);
    prd.primaryImageUrl = `${API_URL}/public${primaryImage?.imageUrl}`;
    return prd;
  });
};
