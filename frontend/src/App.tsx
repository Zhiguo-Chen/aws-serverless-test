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
import SignUp from './pages/SignUp/SignUp';
import NewLogin from './pages/NewLogin/NewLogin';
import HomePage from './pages/HomePage/Home';
import AboutPage from './pages/About/About';
import WishlistPage from './pages/WishlistPage/WishlistPage';
import Cart from './pages/Cart/Cart';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Contact from './pages/Contact/Contact';
import ProductList from './pages/ProductList/ProductList';
import ByCategory from './pages/ByCategory/ByCategory';
import NotFound from './pages/NotFound/NotFound';
import ProductList2 from './pages/product-management/ProductsList2';
import ProductForm from './pages/product-management/ProductForm';
import ManageLayout from './pages/product-management/manage-layout';
import ChatWidget from './components/chat-widget/ChatWidget';

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
        <Route path="/main" element={<MainPageLayout />}>
          <Route path="login" element={<NewLogin />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/main" element={<MainPageLayout />}>
            <Route path="home" element={<HomePage />} />
            <Route path=":categoryId/category" element={<ByCategory />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="cart" element={<Cart />} />
            <Route
              path=":productId/product-detail"
              element={<ProductDetail />}
            />
            <Route path="contact" element={<Contact />} />
            <Route path="view-products" element={<ViewProducts />} />
            {/* <Route path="add-product" element={<AddProducts />} /> */}
            {/* <Route path="product-list-2" element={<ProductList2 />} />
            <Route path="product-list/new" element={<ProductForm />} />
            <Route path="product-list/edit/:id" element={<ProductForm />} /> */}
            {/* <Route path="add-product" element={<AddProducts />} />
            <Route path="view-products" element={<ViewProducts />} />
            <Route path="my-products" element={<MyProducts />} /> */}
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
