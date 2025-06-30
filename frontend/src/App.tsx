import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupInterceptors } from './auth/axiosInstance';
import ChatWidget from './components/chat-widget/ChatWidget';
import BaseRoutes from './routes';

const authTokenKey = process.env.REACT_APP_AUTH_TOKEN || 'authToken';

const App = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem(authTokenKey); // Check if token is present

  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);
  return (
    <div data-mode="light">
      <BaseRoutes />
      {isAuthenticated && <ChatWidget />}
    </div>
  );
};

export default App;
