import path from 'path';
import Cart from '../pages/cart/Cart';
import MainPageLayout from '../pages/main-layout/MainPageLayout';
import Wishlist from '../pages/wish-list/Wishlist';
import Order from '../pages/order/Order';
import ProtectedRoute from '../components/protected-route/protected-route';

const AuthRoutes = {
  path: '/',
  element: <ProtectedRoute />,
  children: [
    {
      path: 'main',
      element: <MainPageLayout />,
      children: [
        {
          path: 'wishlist',
          element: <Wishlist />,
        },
        {
          path: 'cart',
          element: <Cart />,
        },
        {
          path: 'order',
          element: <Order />,
        },
      ],
    },
  ],
};

export default AuthRoutes;
