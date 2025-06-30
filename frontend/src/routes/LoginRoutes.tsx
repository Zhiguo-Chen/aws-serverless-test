import path from 'path';
import Login from '../pages/login/Login';
import SignUp from '../pages/sign-up/SignUp';
import CenterContainer from '../components/center-container/CenterContainer';

const LoginRoutes = {
  path: '/',
  element: <CenterContainer />,
  children: [
    { path: 'login', element: <Login /> },
    { path: 'sign-up', element: <SignUp /> },
  ],
};

// const LoginRoutes = {
//   path: 'sign-up',
//   element: <SignUp />,
// };
export default LoginRoutes;
