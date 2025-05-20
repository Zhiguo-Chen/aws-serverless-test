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

export const createChat = async (formData: any) => {
  const response = await axiosInstance.post(`/api/chat`, formData);
  return response;
};