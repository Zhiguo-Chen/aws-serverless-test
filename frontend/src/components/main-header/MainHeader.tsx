import type { TabsProps } from 'antd';
import { Input, Tabs } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as CartIcon } from '../../assets/icons/Cart1.svg';
import { ReactComponent as SearchIcon } from '../../assets/icons/search.svg';
import { ReactComponent as WishlistIcon } from '../../assets/icons/Wishlist.svg';

const MainHeader = () => {
  const [searchStr, setSearchStr] = useState('');
  const navigate = useNavigate();
  // Set the active tab according to the current path
  const getActiveKey = () => {
    const path = window.location.pathname;
    if (path.startsWith('/main')) return '1';
    if (path.startsWith('/contact')) return '2';
    if (path.startsWith('/about')) return '3';
    if (path.startsWith('/sign-up')) return '4';
    return '1';
  };
  const [activeKey, setActiveKey] = useState(getActiveKey());

  // Listen to route changes and switch tabs automatically
  useEffect(() => {
    const handlePopState = () => {
      setActiveKey(getActiveKey());
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const onChange = (key: string) => {
    setActiveKey(key);
    switch (key) {
      case '1':
        navigate('/main/home');
        break;
      case '2':
        navigate('/contact');
        break;
      case '3':
        navigate('/about');
        break;
      case '4':
        navigate('/sign-up');
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
      label: 'About',
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
          activeKey={activeKey}
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
