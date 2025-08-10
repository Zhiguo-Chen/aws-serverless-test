import { axiosInstance } from '../auth/axiosInstance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getCategories = async () => {
  const response = await axiosInstance.get('/api/categories');
  return response.data;
};

export const createCategory = async (categoryData: any) => {
  const response = await axiosInstance.post('/api/categories', categoryData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};
