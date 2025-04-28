import { Breadcrumb } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.scss';
import Button from '../../components/Button/Button';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-1 not-found-container child-page-padding">
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[{ title: <Link to="/">Home</Link> }, { title: '404 Error' }]}
        />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-column">
          <h1 className="text-4xl font-bold mb-4 text-center">404 Not Found</h1>
          <div className="text-center">
            Your visited page not found. You may go home page.
          </div>
          <div className="mt-4 text-center">
            <Button size="large" onClick={() => navigate('/')}>
              Back to home page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
