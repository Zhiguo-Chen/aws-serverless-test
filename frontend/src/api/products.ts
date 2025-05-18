// frontend/src/api/products.js
import axios from 'axios';
import { axiosInstance } from '../auth/axiosInstance';

const authTokenKey = process.env.REACT_APP_AUTH_TOKEN || 'authToken';

const getAuthHeaders = () => {
  const token = localStorage.getItem(authTokenKey);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProducts = async () => {
  const response = await axiosInstance.get(`/api/products`);
  return response;
};

export const getProductById = async (id: any) => {
  const response = await axiosInstance.get(`/api/products/${id}`);
  return response;
};

export const createProduct = async (formData: any) => {
  const config = {
    ...getAuthHeaders(),
    'Content-Type': 'multipart/form-data',
  };
  const response = await axiosInstance.post(`/api/products`, formData, config);
  return response;
};

export const updateProduct = async (id: any, formData: any) => {
  console.log('updateProduct', id, formData);
  const config = {
    ...getAuthHeaders(),
    'Content-Type': 'multipart/form-data',
  };
  const response = await axiosInstance.put(`/api/products/${id}`, formData, config);
  return response;
};

export const deleteProduct = async (id: any) => {
  const response = await axiosInstance.delete(`/api/products/${id}`);
  return response;
};