import { axiosInstance } from '../auth/axiosInstance';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getCategories = async () => {
  const response = await axiosInstance.get(`${API_URL}/api/categories`);
  return response.data;
};

export const createCategory = async (categoryData: any) => {
  const response = await axiosInstance.post(
    `${API_URL}/api/categories`,
    categoryData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  );
  return response.data;
};
