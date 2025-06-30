import { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

const CenterContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="center-container">
      <Outlet />
    </div>
  );
};

export default CenterContainer;
