import { ReactComponent as ArrowUpIcon } from '../../assets/icons/icons_arrow-up.svg';
import BestSelling from './BestSelling/BestSelling';
import Categories from './Categories/Categories';
import CustomerBenefits from './CustomerBenefits/CustomerBenefits';
import ExploreProducts from './ExploreProducts/ExploreProducts';
import NewArrival from './NewArrival/NewArrival';
import Promotional from './Promotional/Promotional';
import SpecialPromotional from './SpecialPromotional/SpecialPromotional';
import TodaysSales from './TodaysSales/TodaysSales';
import './Home.scss';

const HomePage = () => {
  const handleScroll2Top = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
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
      <div className="customer-benefits-container flex justify-center">
        <CustomerBenefits />
      </div>
      <div className="scroll-to-top-container position-relative">
        <div className="icon-button" onClick={handleScroll2Top}>
          <ArrowUpIcon />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
