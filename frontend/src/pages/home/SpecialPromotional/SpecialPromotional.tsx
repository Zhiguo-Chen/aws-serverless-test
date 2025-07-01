import { useEffect, useState } from 'react';
import boomBox from '../../../assets/images/JBL_BOOMBOX.png';
import { ProductProps } from '../../../types/product';
import { useNavigate } from 'react-router-dom';

const SpecialPromotional = ({ prdouct }: ProductProps) => {
  const navigate = useNavigate();
  const initialDays = 4;
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

  const handleBuy = () => {
    if (!prdouct) {
      console.error('Product is not available');
      return;
    }
    navigate(`/main/${prdouct?.id}/product-detail`);
  };

  return (
    <div className="special-promotional-product full-width flex">
      <div className="flex-1 flex flex-column desc-container flex-gap-2">
        <div className="desc-title">{prdouct?.category?.name}</div>
        <div className="desc-text">Enhance Your Music Experience</div>
        <div className="flex flex-gap-15">
          <div className="time-container flex aligin-center justify-center">
            <div className="special-text-container flex flex-column justify-center">
              <div className="time-text text-center">{days}</div>
              <div className="time-label text-center">Days</div>
            </div>
          </div>
          <div className="time-container flex aligin-center justify-center">
            <div className="special-text-container flex flex-column justify-center">
              <div className="time-text text-center">{hours}</div>
              <div className="time-label text-center">Hours</div>
            </div>
          </div>
          <div className="time-container flex aligin-center justify-center">
            <div className="special-text-container flex flex-column justify-center">
              <div className="time-text text-center">{minutes}</div>
              <div className="time-label text-center">Minutes</div>
            </div>
          </div>
          <div className="time-container flex aligin-center justify-center">
            <div className="special-text-container flex flex-column justify-center">
              <div className="time-text text-center">{seconds}</div>
              <div className="time-label text-center">Seconds</div>
            </div>
          </div>
        </div>
        <div>
          <button className="button-1" onClick={handleBuy}>
            Buy Now!
          </button>
        </div>
      </div>
      <div className="flex-1 flex align-center special-img-container position-relative">
        <img
          src={prdouct?.primaryImageUrl}
          alt="boomBox"
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  );
};

export default SpecialPromotional;
