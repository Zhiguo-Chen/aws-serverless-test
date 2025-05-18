import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const setupInterceptors = (navigate: NavigateFunction) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Clear any authentication tokens or user data if needed
        localStorage.clear();
        // Redirect to the login page
        navigate('/main/login');
      }
      return Promise.reject(error);
    },
  );
};

export { axiosInstance, setupInterceptors };
