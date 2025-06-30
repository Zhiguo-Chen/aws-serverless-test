import { Dropdown, MenuProps, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

const TopBannerInfo = () => {
  const navigate = useNavigate();
  const items: MenuProps['items'] = [
    {
      label: (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/main/about');
          }}
        >
          My orders
        </a>
      ),
      key: '0',
    },
    {
      label: (
        <a
          href="https://www.aliyun.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          2nd menu item
        </a>
      ),
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label: '3rd menu item',
      key: '3',
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
