import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { setupInterceptors } from './auth/axiosInstance';
import ChatWidget from './components/chat-widget/ChatWidget';
import ProtectedRoute from './components/protected-route/protected-route';
import AboutPage from './pages/about/About';
import ByCategory from './pages/by-category/ByCategory';
import Cart from './pages/cart/Cart';
import Contact from './pages/contact/Contact';
import HomePage from './pages/home/Home';
import MainPageLayout from './pages/main-layout/MainPageLayout';
import NewLogin from './pages/new-login/NewLogin';
import NotFound from './pages/not-found/NotFound';
import ProductDetail from './pages/product-detail/ProductDetail';
import ProductForm from './pages/product-management/ProductForm';
import ProductList2 from './pages/product-management/ProductsList2';
import ManageLayout from './pages/product-management/manage-layout';
import Register from './pages/register/register';
import SignUp from './pages/sign-up/SignUp';
import ViewProducts from './pages/view-products/ ViewProducts';
import Wishlist from './pages/wish-list/Wishlist';

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
            <Navigate to={isAuthenticated ? '/main/home' : '/main/login'} />
          }
        />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/main-page" element={<MainPageLayout />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="login" element={<NewLogin />} />
        {/* <Route path="/main" element={<MainPageLayout />}>
          <Route path="login" element={<NewLogin />} />
        </Route> */}
        <Route element={<ProtectedRoute />}>
          <Route path="/main" element={<MainPageLayout />}>
            <Route path="home" element={<HomePage />} />
            <Route path=":categoryId/category" element={<ByCategory />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="cart" element={<Cart />} />
            <Route
              path=":productId/product-detail"
              element={<ProductDetail />}
            />
            <Route path="contact" element={<Contact />} />
            <Route path="view-products" element={<ViewProducts />} />
            {/* <Route path="product-list-2" element={<ProductList2 />} />
            <Route path="product-list/new" element={<ProductForm />} />
            <Route path="product-list/edit/:id" element={<ProductForm />} /> */}
          </Route>
          <Route path="/management" element={<ManageLayout />}>
            <Route path="product-list" element={<ProductList2 />} />
            <Route path="product-list/new" element={<ProductForm />} />
            <Route path="product-list/edit/:id" element={<ProductForm />} />
          </Route>
        </Route>
        <Route path="*" element={<MainPageLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      {isAuthenticated && <ChatWidget />}
    </div>
  );
};

export default App;
