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
import MainHeader from '../../components/main-header/MainHeader';
import './MainPageLayout.scss';
import NewArrival from '../home/NewArrival/NewArrival';
import Promotional from '../home/Promotional/Promotional';
import SpecialPromotional from '../home/SpecialPromotional/SpecialPromotional';
import TodaysSales from '../home/TodaysSales/TodaysSales';
import HomePage from '../home/Home';
import { Outlet } from 'react-router-dom';
import TopBannerInfo from '../../components/top-banner-info/TopBannerInfo';

interface MainPageLayoutProps {}

const { Search } = Input;

const MainPageLayout: FC<MainPageLayoutProps> = () => {
  const handleScroll2Top = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="main-container flex flex-column">
      <TopBannerInfo />
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
