import { axiosInstance } from '../auth/axiosInstance';

export interface OrderInfo {
  paymentMethod: string;
  cartItemIds: string[];
  shippingAddress: {
    address: String;
    city: String;
    country: String;
    postalCode: String;
  };
}

export const createNewOrder = async (formData: OrderInfo) => {
  const response = await axiosInstance.post(`/api/order/new`, formData);
  return response;
};

export const getOrderList = async () => {
  const response = await axiosInstance.get('/api/order/list');
  return response.data;
};

export const deleteOrder = async (orderId: string) => {
  const response = await axiosInstance.delete(`/api/order/${orderId}`);
  return response.data;
};
