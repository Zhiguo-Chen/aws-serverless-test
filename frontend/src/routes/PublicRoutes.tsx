import AboutPage from '../pages/about/About';
import HomePage from '../pages/home/Home';
import MainPageLayout from '../pages/main-layout/MainPageLayout';
import ProductDetail from '../pages/product-detail/ProductDetail';
import FilteredProducts from '../pages/filtered-products/FilteredProducts';
import Contact from '../pages/contact/Contact';
import { Outlet } from 'react-router-dom';

const PublicRoutes = {
  path: '/',
  element: <Outlet />,
  children: [
    {
      path: 'main',
      element: <MainPageLayout />,
      children: [
        {
          path: 'home',
          element: <HomePage />,
        },
        {
          path: ':productId/product-detail',
          element: <ProductDetail />,
        },
        {
          path: 'search-products',
          element: <FilteredProducts />,
        },
        {
          path: 'search-products/:category',
          element: <FilteredProducts />,
        },
      ],
    },
    {
      path: 'contact',
      element: <MainPageLayout />,
      children: [{ path: '', element: <Contact /> }],
    },
    {
      path: 'about',
      element: <MainPageLayout />,
      children: [{ path: '', element: <AboutPage /> }],
    },
  ],
};

export default PublicRoutes;
