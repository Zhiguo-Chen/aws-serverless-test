import {
  DownOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space, Input, Carousel } from 'antd';
import { FC } from 'react';
import './MainPageLayout.scss';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { ReactComponent as WishlistIcon } from '../../assets/icons/Wishlist.svg';
import { ReactComponent as CartIcon } from '../../assets/icons/Cart1.svg';
import iphone14 from '../../assets/images/iphone14.png';
import { ReactComponent as AppleIcon } from '../../assets/icons/Apple.svg';
import { ReactComponent as VectorIcon } from '../../assets/icons/Vector2.svg';
import MainHeader from './MainHeader/MainHeader';
import Promotional from './Promotional/Promotional';
import TodaysSales from './TodaysSales/TodaysSales';
import Categories from './Categories/Categories';
import BestSelling from './BestSelling/BestSelling';
import SpecialPromotional from './SpecialPromotional/SpecialPromotional';
import ExploreProducts from './ExploreProducts/ExploreProducts';
import NewArrival from './NewArrival/NewArrival';

interface MainPageLayoutProps {}

const { Search } = Input;

const items: MenuProps['items'] = [
  {
    label: (
      <a
        href="https://www.antgroup.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        1st menu item
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

const MainPageLayout: FC<MainPageLayoutProps> = () => {
  return (
    <div className="main-container">
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
                  Click me
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
        </div>
      </div>
      <header className="sticky-header-container">
        <MainHeader />
      </header>
      <div className="flex flex-column content-width section-gap">
        <div className="promotional-section">
          <Promotional />
        </div>
        <div className="today-sales-container dividing-line">
          <TodaysSales />
        </div>
        <div className="categories-container dividing-line">
          <Categories />
        </div>
        <div className="best-selling-container bottom-padding">
          <BestSelling />
        </div>
        <div className="special-promotional-container">
          <SpecialPromotional />
        </div>
        <div className="explore-products-container bottom-padding">
          <ExploreProducts />
        </div>
        <div className="new-arrival-container bottom-padding">
          <NewArrival />
        </div>
        <div className="customer-benefits-container">
          This is Customer Benefits
        </div>
      </div>
      <footer className="footer-container content-width">This is footer</footer>
    </div>
  );
};

export default MainPageLayout;
