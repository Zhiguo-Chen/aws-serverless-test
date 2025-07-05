import { Dropdown, MenuProps, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const TopBannerInfo = () => {
  const { user, isAuthenticated, logout } = useUser();
  console.log('user', user);
  const navigate = useNavigate();
  const items: MenuProps['items'] = [
    {
      label: (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/main/order');
          }}
        >
          My orders
        </a>
      ),
      key: '0',
    },
    // 仅当 user.isSeller 为 true 时才添加 Management 菜单项
    ...(user?.isSeller
      ? [
          {
            label: (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/management/product-list');
                }}
              >
                Management
              </a>
            ),
            key: '1',
          },
        ]
      : []),
    {
      type: 'divider',
    },
  ];

  return (
    <div className="top-banner">
      <div className="content-width text-center position-relative">
        <span>
          Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!
          ShopNow
        </span>
        <div className="position-absolute" style={{ right: 0, top: 0 }}>
          <Dropdown menu={{ items }} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                About me
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default TopBannerInfo;
