import AboutPage from '../pages/about/About';
import HomePage from '../pages/home/Home';
import MainPageLayout from '../pages/main-layout/MainPageLayout';
import ProductDetail from '../pages/product-detail/ProductDetail';
import FilteredProducts from '../pages/filtered-products/FilteredProducts';

const PublicRoutes = {
  path: '/main',
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
      path: 'about',
      element: <AboutPage />,
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
};

export default PublicRoutes;
