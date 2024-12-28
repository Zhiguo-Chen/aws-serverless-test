import { useEffect, useState } from 'react';
import { ReactComponent as LeftArrowIcon } from '../../../assets/icons/Vector_left.svg';
import { ReactComponent as RightArrowIcon } from '../../../assets/icons/Vector_right.svg';
import chair from '../../../assets/images/chair.png';
import controller from '../../../assets/images/controller.png';
import keyBoard from '../../../assets/images/keyBoard.png';
import monitor from '../../../assets/images/monitor.png';
import { ReactComponent as WishlistIcon } from '../../../assets/icons/Wishlist2.svg';
import { ReactComponent as EyeIcon } from '../../../assets/icons/eye.svg';
import { ReactComponent as StarIcon } from '../../../assets/icons/Star.svg';
import Icon, { StarFilled } from '@ant-design/icons';

const TodaysSales = () => {
  const initialDays = 4;
  const totalStars = 5;
  const productsList = [
    {
      image: controller,
      name: 'HAVIT HV-G92 Gamepad',
      price: 120,
      oldPrice: 160,
      score: 5,
      reviews: 88,
    },
    {
      image: keyBoard,
      name: 'AK-900 Wired Keyboard',
      price: 960,
      oldPrice: 1160,
      score: 4,
      reviews: 75,
    },
    {
      image: monitor,
      name: 'IPS LCD Gaming Monitor',
      price: 370,
      oldPrice: 400,
      score: 5,
      reviews: 99,
    },
    {
      image: chair,
      name: 'S-Series Comfort Chair ',
      price: 375,
      oldPrice: 400,
      score: 4,
      reviews: 99,
    },
  ];

  const [timeLeft, setTimeLeft] = useState(initialDays * 24 * 60 * 60); // Convert days to seconds

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
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
            <div className="section-title-container flex align-center flex-gap">
              <div className="title-bar"></div>
              <div className="section-title">Today’s</div>
            </div>
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
        {productsList.map((product: any, index: any) => (
          <div key={index} className="sales-item">
            <div className="image-bg flex justify-center align-center position-relative">
              <img src={product.image} alt={`Sale ${index}`} />
              <label className="discount-info text-center">
                -{Math.ceil((1 - product.price / product.oldPrice) * 100)}%
              </label>
              <div className="action-button-container flex flex-column flex-gap-05">
                <button>
                  <WishlistIcon />
                </button>
                <button>
                  <EyeIcon />
                </button>
              </div>
              <button className="add-to-cart">Add To Cart</button>
            </div>
            <div className="product-info-container flex flex-column flex-gap-05">
              <div className="product-name-container">{product.name}</div>
              <div className="flex flex-gap-075">
                <div className="price">${product.price}</div>
                <div className="old-price">${product.oldPrice}</div>
              </div>
              <div>
                {/* <StarFilled style={{ color: '#FFAD33' }} /> */}
                {Array.from({ length: totalStars }, (_, index) => {
                  if (index < product.score) {
                    return (
                      <StarFilled
                        key={index}
                        style={{ color: '#FFAD33', marginRight: '4px' }}
                      />
                    );
                  } else {
                    return (
                      <StarFilled
                        key={index}
                        style={{ color: '#D1D4DB', marginRight: '4px' }}
                      />
                    );
                  }
                })}
                {
                  // for(let i = 0; i < totalStars; i++) {
                  // }
                }
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center full-width view-all-container">
        <button className="view-all-button">View All Products</button>
      </div>
    </div>
  );
};

export default TodaysSales;
