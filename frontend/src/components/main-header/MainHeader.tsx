import { ReactComponent as WishlistIcon } from '../../assets/icons/Wishlist.svg';
import { ReactComponent as CartIcon } from '../../assets/icons/Cart1.svg';
import { MenuProps, Tabs, Input } from 'antd';
import type { TabsProps } from 'antd';
import { FC, useState } from 'react';
import { ReactComponent as SearchIcon } from '../../assets/icons/search.svg';
import { useNavigate } from 'react-router-dom';
import { searchProduct } from '../../api/products';

const { Search } = Input;
const MainHeader = () => {
  const [searchStr, setSearchStr] = useState('');
  const navigate = useNavigate();
  const onChange = (key: string) => {
    console.log(key);
    switch (key) {
      case '1':
        navigate('/main/home');
        break;
      case '2':
        // navigate('/main/contact');
        navigate('/main/view-products');
        break;
      case '3':
        navigate('/main/about');
        break;
      case '4':
        navigate('/main/sign-up');
        break;
    }
  };

  const onSearch = async () => {
    // const data = await searchProduct(searchStr);
    // console.log(data);
    navigate(
      `/main/search-products?searchStr=${encodeURIComponent(searchStr)}`,
    );
  };
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
  const handleWishlistClick = (e: React.MouseEvent) => {
    navigate('/main/wishlist');
  };
  const handleCartClick = (e: React.MouseEvent) => {
    navigate('/main/cart');
  };
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
      <div className="search-input flex align-center">
        <Input
          value={searchStr}
          onChange={(e) => setSearchStr(e.target.value)}
          onPressEnter={onSearch}
          placeholder="What are you looking for?"
          suffix={
            <span className="suffix-icon" onClick={onSearch}>
              <SearchIcon />
            </span>
          }
        />
      </div>
      <div className="flex flex-gap">
        <WishlistIcon
          width="32px"
          height="32px"
          className="cursor-pointer"
          onClick={handleWishlistClick}
        ></WishlistIcon>
        <CartIcon
          width="32px"
          height="32px"
          className="cursor-pointer"
          onClick={handleCartClick}
        ></CartIcon>
      </div>
    </div>
  );
};

export default MainHeader;
