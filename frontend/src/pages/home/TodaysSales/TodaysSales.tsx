import { useEffect, useState } from 'react';
import { ReactComponent as LeftArrowIcon } from '../../../assets/icons/Vector_left.svg';
import { ReactComponent as RightArrowIcon } from '../../../assets/icons/Vector_right.svg';
import ProductItem from '../../../components/ProductItem/ProductItem';
import SectionName from '../../../components/SectionName/SectionName';
import { Product, ProductsProps } from '../../../types/product';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const TodaysSales = ({ prdouctList }: ProductsProps) => {
  // 假设所有商品的 flashSaleEndsAt 一致，取第一个商品的 flashSaleEndsAt
  const flashSaleEndsAt = prdouctList[0]?.flashSaleEndsAt;
  // 兼容 flashSaleEndsAt 可能为 Date 类型或字符串
  const getTimeLeft = (endTime: string | Date) => {
    const now = new Date();
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
    const diff = Math.max(
      0,
      Math.floor((end.getTime() - now.getTime()) / 1000),
    ); // 秒数
    return diff;
  };

  const [timeLeft, setTimeLeft] = useState(() =>
    flashSaleEndsAt ? getTimeLeft(flashSaleEndsAt) : 0,
  );

  // 定时器每秒刷新
  useEffect(() => {
    if (!flashSaleEndsAt) return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(flashSaleEndsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [flashSaleEndsAt]);

  const calculateTimeLeft = (_seconds: number) => {
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
        {prdouctList.map((product: Product, index: number) => (
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
            actionButtonPlace={true}
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
