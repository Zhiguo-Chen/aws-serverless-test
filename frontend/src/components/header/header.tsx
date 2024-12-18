import { useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, MenuProps, Dropdown } from 'antd';

const Header = () => {
  const handleEditProducts = () => {
    navigate('/main/my-products');
  };
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a rel="noopener noreferrer" onClick={handleEditProducts}>
          Eidt my products
        </a>
      ),
    },
  ];
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/login');
  };
  return (
    <div className="header-container flex justify-end align-center full-height">
      <Dropdown menu={{ items }} placement="bottomLeft">
        <Avatar
          style={{ backgroundColor: '#87d068' }}
          icon={<UserOutlined />}
        />
      </Dropdown>
    </div>
  );
};

export default Header;
