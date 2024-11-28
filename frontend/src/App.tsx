import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Register from './pages/register/register';
import Login from './pages/login/Login';
import MainLayout from './components/main-layout/main-layout';
import AddProducts from './pages/add-products/Add-Products';
import ProtectedRoute from './components/protected-route/protected-route';

const App = () => (
  <div data-mode="light">
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/main" element={<MainLayout />}>
            <Route path="add-product" element={<AddProducts />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
