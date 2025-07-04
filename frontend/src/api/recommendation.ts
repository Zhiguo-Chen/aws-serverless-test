import { axiosInstance } from '../auth/axiosInstance';

export const getRecommendations = async (productId: string) => {
  const response = await axiosInstance.get(`/api/recommendations/${productId}`);
  return response.data;
};
