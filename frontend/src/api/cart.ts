import { axiosInstance } from '../auth/axiosInstance';

export interface CartItem {
  productId: string;
  quantity: number;
}

export const addToCart = async (formData: CartItem) => {
  const response = await axiosInstance.post(`/api/cart/add`, formData);
  return response;
};

export const getCartItems = async () => {
  const response = await axiosInstance.get(`/api/cart/list-all`);
  return response;
};

export const removeFromCart = async (id: string) => {
  const response = await axiosInstance.delete(`/api/cart/delete/${id}`);
  return response;
};
