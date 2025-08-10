import { Navigate, useRoutes } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import AuthRoutes from './AuthRoutes';
import ManagementRoutes from './ManagementRoutes';
import LoginRoutes from './LoginRoutes';
import MainPageLayout from '../pages/main-layout/MainPageLayout';
import NotFound from '../pages/not-found/NotFound';

const authTokenKey = import.meta.env.VITE_AUTH_TOKEN || 'authToken';

export default function BaseRoutes() {
  const isAuthenticated = !!localStorage.getItem(authTokenKey);
  return useRoutes([
    {
      path: '/',
      element: <Navigate to={isAuthenticated ? '/main/home' : '/main/login'} />,
    },
    PublicRoutes,
    AuthRoutes,
    ManagementRoutes,
    LoginRoutes,
    {
      path: '*',
      element: <MainPageLayout />,
      children: [
        {
          path: '*',
          element: <NotFound />,
        },
      ],
    },
  ]);
}
