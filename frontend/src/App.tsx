import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import Register from './pages/register/register';
import Login from './pages/login/Login';
import MainLayout from './components/main-layout/main-layout';
import AddProducts from './pages/add-products/Add-Products';
import ProtectedRoute from './components/protected-route/protected-route';
import { useEffect } from 'react';
import { setupInterceptors } from './auth/axiosInstance';
import ListProducts from './pages/list-pruducts/List-Pruducts';
import ViewProducts from './pages/view-products/ ViewProducts';
import MyProducts from './pages/my-products/MyProducts';
import MainPageLayout from './pages/MainPageLayout/MainPageLayout';

const authTokenKey = process.env.REACT_APP_AUTH_TOKEN || 'authToken';

const App = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem(authTokenKey); // Check if token is present

  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);
  return (
    <div data-mode="light">
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? '/main/view-products' : '/login'} />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main-page" element={<MainPageLayout />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/main" element={<MainLayout />}>
            <Route path="add-product" element={<AddProducts />} />
            <Route path="view-products" element={<ViewProducts />} />
            <Route path="my-products" element={<MyProducts />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
