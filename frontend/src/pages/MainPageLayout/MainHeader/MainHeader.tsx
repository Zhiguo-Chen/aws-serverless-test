import { ReactComponent as WishlistIcon } from '../../../assets/icons/Wishlist.svg';
import { ReactComponent as CartIcon } from '../../../assets/icons/Cart1.svg';
import { MenuProps, Tabs, Input } from 'antd';
import type { TabsProps } from 'antd';
import { FC } from 'react';

const { Search } = Input;
const MainHeader = () => {
  const onChange = (key: string) => {
    console.log(key);
  };

  const onSearch = () => {};
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Home',
    },
    {
      key: '2',
      label: 'Contact',
    },
    {
      key: '3',
      label: 'Aout',
    },
    {
      key: '4',
      label: 'Sign Up',
    },
  ];
  return (
    <div className="header-content-container content-width flex align-center justify-between">
      <h3 className="header-title">Exclusive</h3>
      <div className="header-tabs-container">
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          size="large"
          indicator={{ align: 'end' }}
        />
      </div>
      <div>
        <Search
          placeholder="What are you looking for?"
          onSearch={onSearch}
          size="large"
          style={{ width: 250 }}
        />
      </div>
      <div className="flex flex-gap">
        {/* <HeartOutlined style={{ fontSize: 32 }} />
      <ShoppingCartOutlined style={{ fontSize: 32 }} /> */}
        <WishlistIcon
          width="32px"
          height="32px"
          className="cursor-pointer"
        ></WishlistIcon>
        <CartIcon
          width="32px"
          height="32px"
          className="cursor-pointer"
        ></CartIcon>
      </div>
    </div>
  );
};

export default MainHeader;
