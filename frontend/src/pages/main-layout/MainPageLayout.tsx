import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Input, Space } from 'antd';
import { FC } from 'react';
import { ReactComponent as ArrowUpIcon } from '../../assets/icons/icons_arrow-up.svg';
import BestSelling from '../home/BestSelling/BestSelling';
import Categories from '../home/Categories/Categories';
import CustomerBenefits from '../home/CustomerBenefits/CustomerBenefits';
import ExploreProducts from '../home/ExploreProducts/ExploreProducts';
import Footer from '../footer/Footer';
import MainHeader from '../main-header/MainHeader';
import './MainPageLayout.scss';
import NewArrival from '../home/NewArrival/NewArrival';
import Promotional from '../home/Promotional/Promotional';
import SpecialPromotional from '../home/SpecialPromotional/SpecialPromotional';
import TodaysSales from '../home/TodaysSales/TodaysSales';
import HomePage from '../home/Home';
import { Outlet } from 'react-router-dom';

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
  const handleScroll2Top = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="main-container flex flex-column">
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
      <div className="main-content justify-center content-width full-width">
        <Outlet></Outlet>
      </div>
      <footer className="footer-container">
        <Footer />
      </footer>
    </div>
  );
};

export default MainPageLayout;
