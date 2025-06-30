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
import { useEffect, useState } from 'react';
import { getProducts } from '../../api/products';
import { message } from 'antd';
import { Product } from '../../types/product';
import { API_URL } from '../../const/API_URL';

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [exploreProducts, setExploreProducts] = useState<Product[]>([]);
  const [specialPromotionalProducts, setSpecialPromotionalProducts] = useState<
    Product[]
  >([]);
  const [flashSalesProducts, setFlashSalesProducts] = useState<Product[]>([]);
  const handleScroll2Top = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      if (response.data.length > 0) {
        const tmpData = response.data.map((prd: Product) => {
          const primaryImage = prd.productImages.find((img) => img.isPrimary);
          prd.primaryImageUrl = `${API_URL}/public${primaryImage?.imageUrl}`;
          return prd;
        });
        setProducts(tmpData);
      }

      // filterProducts();
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    console.log('filterProducts', products);
    const featured = products.filter((prd: Product) => prd.isFeatured);
    const newArrival = products.filter((prd: Product) => prd.isNewArrival);
    const bestSelling = products.filter((prd: Product) => prd.isBestSelling);
    const explore = products.filter((prd: Product) => prd.isExplored);
    const specialPromotional = products.filter(
      (prd: Product) => prd.isSpecialPromotional,
    );
    const flashSales = products.filter((prd: Product) => prd.isFlashSale);

    setFeaturedProducts(featured);
    setNewArrivalProducts(newArrival);
    setBestSellingProducts(featured); // TODO: fix this
    setExploreProducts(explore);
    setSpecialPromotionalProducts(specialPromotional);
    setFlashSalesProducts(flashSales);
  };
  return (
    <div className="flex flex-column content-width section-gap">
      <div className="promotional-section">
        <Promotional prdouctList={featuredProducts} />
      </div>
      <div className="today-sales-container dividing-line">
        <TodaysSales />
      </div>
      <div className="categories-container dividing-line">
        <Categories />
      </div>
      <div className="best-selling-container bottom-padding">
        <BestSelling prdouctList={bestSellingProducts} />
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
