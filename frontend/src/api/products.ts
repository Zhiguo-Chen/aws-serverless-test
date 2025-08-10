import { axiosInstance } from '../auth/axiosInstance';

const authTokenKey = import.meta.env.VITE_AUTH_TOKEN || 'authToken';

const getAuthHeaders = () => {
  const token = localStorage.getItem(authTokenKey);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const config = {
  ...getAuthHeaders(),
  'Content-Type': 'multipart/form-data',
};

export const getProducts = async () => {
  const response = await axiosInstance.get(`/api/products/list-all`);
  return response;
};

export const getProductById = async (id: any) => {
  const response = await axiosInstance.get(`/api/products/${id}`);
  return response;
};

export const searchProduct = async (searchStr: string) => {
  const response = await axiosInstance.post(`/api/products/search`, {
    query: searchStr,
  });
  return response;
};

export const searchByCategory = async (category: string) => {
  const response = await axiosInstance.get(`/api/products/search/${category}`);
  return response;
};

export const createProduct = async (formData: any) => {
  const response = await axiosInstance.post(
    `/api/products/add`,
    formData,
    config,
  );
  return response;
};

export const updateProduct = async (id: any, formData: any) => {
  console.log('updateProduct', id, formData);
  const response = await axiosInstance.put(
    `/api/products/${id}`,
    formData,
    config,
  );
  return response;
};

export const deleteProduct = async (id: any) => {
  const response = await axiosInstance.delete(`/api/products/${id}`);
  return response;
};
