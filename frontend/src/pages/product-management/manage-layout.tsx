import { Outlet } from 'react-router-dom';

const ManageLayout = () => {
  return (
    <div className="mgt-layout-container">
      <Outlet></Outlet>
    </div>
  );
};

export default ManageLayout;
