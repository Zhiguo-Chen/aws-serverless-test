import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Register from './pages/register/register';
import Login from './pages/login/Login';
import MainLayout from './components/main-layout/main-layout';
import AddProducts from './pages/add-products/Add-Products';
import ProtectedRoute from './components/protected-route/protected-route';
import { useEffect } from 'react';
import { setupInterceptors } from './auth/axiosInstance';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);
  return (
    <div data-mode="light">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/main" element={<MainLayout />}>
            <Route path="add-product" element={<AddProducts />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
