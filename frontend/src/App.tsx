import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupInterceptors } from './auth/axiosInstance';
import ChatWidget from './components/chat-widget/ChatWidget';
import BaseRoutes from './routes';
import { UserProvider, useUser } from './contexts/UserContext';

const authTokenKey = process.env.REACT_APP_AUTH_TOKEN || 'authToken';

const App = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem(authTokenKey); // Check if token is present
  // const { isAuthenticated } = useUser();

  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);
  return (
    <UserProvider>
      <div data-mode="light">
        <BaseRoutes />
        {isAuthenticated && <ChatWidget />}
      </div>
    </UserProvider>
  );
};

export default App;
