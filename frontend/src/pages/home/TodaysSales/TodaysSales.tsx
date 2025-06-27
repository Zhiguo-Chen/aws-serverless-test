import { StarFilled } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { ReactComponent as EyeIcon } from '../../../assets/icons/eye.svg';
import { ReactComponent as LeftArrowIcon } from '../../../assets/icons/Vector_left.svg';
import { ReactComponent as RightArrowIcon } from '../../../assets/icons/Vector_right.svg';
import { ReactComponent as WishlistIcon } from '../../../assets/icons/Wishlist2.svg';
import chair from '../../../assets/images/chair.png';
import controller from '../../../assets/images/controller.png';
import keyBoard from '../../../assets/images/keyBoard.png';
import monitor from '../../../assets/images/monitor.png';
import ProductItem from '../../../components/ProductItem/ProductItem';
import SectionName from '../../../components/SectionName/SectionName';
import { getProducts } from '../../../api/products';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const TodaysSales = () => {
  const initialDays = 4;
  const totalStars = 5;
  let productsList = [
    {
      image: controller,
      name: 'HAVIT HV-G92 Gamepad',
      price: 120,
      originalPrice: 160,
      score: 5,
      reviews: 88,
    },
    {
      image: keyBoard,
      name: 'AK-900 Wired Keyboard',
      price: 960,
      originalPrice: 1160,
      score: 4,
      reviews: 75,
    },
    {
      image: monitor,
      name: 'IPS LCD Gaming Monitor',
      price: 370,
      originalPrice: 400,
      score: 5,
      reviews: 99,
    },
    {
      image: chair,
      name: 'S-Series Comfort Chair ',
      price: 375,
      originalPrice: 400,
      score: 4,
      reviews: 99,
    },
  ];
  const [products, setProducts] = useState<any[]>([]);

  const [timeLeft, setTimeLeft] = useState(initialDays * 24 * 60 * 60); // Convert days to seconds

  useEffect(() => {
    // const intervalId = setInterval(() => {
    //   setTimeLeft(timeLeft - 1);
    // }, 1000);

    // return () => clearInterval(intervalId);
    const getAllProducts = async () => {
      const response = await getProducts();
      const data = response.data as Array<any>;
      setProducts(
        data
          .filter((prd) => prd.isFlashSale)
          .map((prd) => ({
            ...prd,
            image: `${API_URL}/public${prd.imageUrl}`,
            price: parseInt(prd.price),
          })),
      );
      setTimeout(() => {
        console.log(products);
      });
    };
    getAllProducts();
  }, [timeLeft]);

  const calculateTimeLeft = (_seconds: any) => {
    const days = Math.floor(_seconds / (24 * 60 * 60));
    const hours = Math.floor((_seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((_seconds % (60 * 60)) / 60);
    const seconds = _seconds % 60;
    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = calculateTimeLeft(timeLeft);
  return (
    <div>
      <div className="flex justify-between align-end">
        <div className="flex align-end">
          <div className="section-info-container">
            <SectionName title="Today’s" />
            <div className="flash-sales-title">Flash Sales</div>
          </div>
          <div className="flex align-end flex-gap">
            <div>
              <div className="time-title">Days</div>
              <div className="time-number">{days}</div>
            </div>
            <div className="time-separator">:</div>
            <div>
              <div className="time-title">Hours</div>
              <div className="time-number">{hours}</div>
            </div>
            <div className="time-separator">:</div>
            <div>
              <div className="time-title">Minutes</div>
              <div className="time-number">{minutes}</div>
            </div>
            <div className="time-separator">:</div>
            <div>
              <div className="time-title">Seconds</div>
              <div className="time-number">{seconds}</div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-gap-05">
            <div className="arrow-icon-wrapper">
              <LeftArrowIcon />
            </div>
            <div className="arrow-icon-wrapper">
              <RightArrowIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-gap-2 sales-container">
        {products.map((product: any, index: any) => (
          <ProductItem
            product={product}
            labelPlace={
              <label className="discount-info text-center">
                {product.originalPrice && product.originalPrice > 0
                  ? -Math.ceil(
                      (1 - product.price / product.originalPrice) * 100,
                    ) + '%'
                  : ''}
              </label>
            }
            actionButtonPlace={
              <div className="action-button-container flex flex-column flex-gap-05">
                <button>
                  <WishlistIcon />
                </button>
                <button>
                  <EyeIcon />
                </button>
              </div>
            }
            isSocreShow={true}
            key={index}
          />
        ))}
      </div>
      <div className="flex justify-center full-width view-all-container">
        <button className="view-all-button">View All Products</button>
      </div>
    </div>
  );
};

export default TodaysSales;
