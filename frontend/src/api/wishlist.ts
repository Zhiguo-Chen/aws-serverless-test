import { axiosInstance } from '../auth/axiosInstance';

export const addToWishlist = async (productId: string) => {
  const response = await axiosInstance.post(`/api/wishlist`, { productId });
  return response;
};

export const getWishlist = async () => {
  const response = await axiosInstance.get(`/api/wishlist`);
  return response;
};

export const removeFromWishlist = async (productId: string) => {
  const response = await axiosInstance.delete(`/api/wishlist/${productId}`);
  return response;
};
