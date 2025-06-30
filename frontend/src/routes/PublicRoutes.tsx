import AboutPage from '../pages/about/About';
import HomePage from '../pages/home/Home';
import MainPageLayout from '../pages/main-layout/MainPageLayout';
import ViewProducts from '../pages/view-products/ViewProducts';

const PublicRoutes = {
  path: '/main',
  element: <MainPageLayout />,
  children: [
    {
      path: 'home',
      element: <HomePage />,
    },
    {
      path: 'about',
      element: <AboutPage />,
    },
    {
      path: 'view-products',
      element: <ViewProducts />,
    }
  ],
};

export default PublicRoutes;
