import { Carousel } from 'antd';
import iphone14 from '../../../assets/images/iphone14.png';
import { ReactComponent as AppleIcon } from '../../../assets/icons/Apple.svg';
import { ReactComponent as VectorIcon } from '../../../assets/icons/Vector2.svg';
const Promotional = () => {
  const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '344px',
    color: '#fff',
    lineHeight: '344px',
    textAlign: 'center',
    background: '#000',
  };
  return (
    <div className="promotional-container bottom-padding flex">
      <div className="promotional-categories">
        <ul className="flex flex-column flex-gap position-relative">
          <li>Woman’s Fashion</li>
          <li>Men’s Fashion</li>
          <li>Electronics</li>
          <li>Home & Lifestyle</li>
          <li>Medicine</li>
          <li>Sports & Outdoor</li>
          <li>Baby’s & Toys</li>
          <li>Groceries & Pets</li>
          <li>Health & Beauty</li>
        </ul>
      </div>
      <div className="carousel-container flex-1">
        <Carousel autoplay>
          <div>
            <div className="flex car1-container">
              <div
                className="flex-1 desc-container flex flex-column position-relative"
                style={{ gap: '20px' }}
              >
                <div className="flex align-center flex-gap-15">
                  <AppleIcon></AppleIcon>
                  <div className="regular-font">iPhone 14 Series</div>
                </div>
                <div
                  style={{
                    width: '294px',
                    fontSize: '48px',
                    fontWeight: 400,
                  }}
                >
                  <div>Up to 10% off Voucher</div>
                </div>
                <div className="show-now-button flex align-center flex-gap-05 cursor-pointer">
                  <div className="light-font hover-underline">Show Now</div>
                  <VectorIcon></VectorIcon>
                </div>
              </div>
              <div className="flex-1">
                <img
                  src={iphone14}
                  alt="iphone14"
                  style={{
                    width: '450px',
                    height: '320px',
                    position: 'relative',
                    top: '24px',
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex car1-container">
              <div
                className="flex-1 desc-container flex flex-column position-relative"
                style={{ gap: '20px' }}
              >
                <div className="flex align-center flex-gap-15">
                  <AppleIcon></AppleIcon>
                  <div className="regular-font">iPhone 14 Series</div>
                </div>
                <div
                  style={{
                    width: '294px',
                    fontSize: '48px',
                    fontWeight: 400,
                  }}
                >
                  <div>Up to 10% off Voucher</div>
                </div>
                <div className="show-now-button flex align-center flex-gap-05 cursor-pointer">
                  <div className="light-font hover-underline">Show Now</div>
                  <VectorIcon></VectorIcon>
                </div>
              </div>
              <div className="flex-1">
                <img
                  src={iphone14}
                  alt="iphone14"
                  style={{
                    width: '450px',
                    height: '320px',
                    position: 'relative',
                    top: '24px',
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex car1-container">
              <div
                className="flex-1 desc-container flex flex-column position-relative"
                style={{ gap: '20px' }}
              >
                <div className="flex align-center flex-gap-15">
                  <AppleIcon></AppleIcon>
                  <div className="regular-font">iPhone 14 Series</div>
                </div>
                <div
                  style={{
                    width: '294px',
                    fontSize: '48px',
                    fontWeight: 400,
                  }}
                >
                  <div>Up to 10% off Voucher</div>
                </div>
                <div className="show-now-button flex align-center flex-gap-05 cursor-pointer">
                  <div className="light-font hover-underline">Show Now</div>
                  <VectorIcon></VectorIcon>
                </div>
              </div>
              <div className="flex-1">
                <img
                  src={iphone14}
                  alt="iphone14"
                  style={{
                    width: '450px',
                    height: '320px',
                    position: 'relative',
                    top: '24px',
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex car1-container">
              <div
                className="flex-1 desc-container flex flex-column position-relative"
                style={{ gap: '20px' }}
              >
                <div className="flex align-center flex-gap-15">
                  <AppleIcon></AppleIcon>
                  <div className="regular-font">iPhone 14 Series</div>
                </div>
                <div
                  style={{
                    width: '294px',
                    fontSize: '48px',
                    fontWeight: 400,
                  }}
                >
                  <div>Up to 10% off Voucher</div>
                </div>
                <div className="show-now-button flex align-center flex-gap-05 cursor-pointer">
                  <div className="light-font hover-underline">Show Now</div>
                  <VectorIcon></VectorIcon>
                </div>
              </div>
              <div className="flex-1">
                <img
                  src={iphone14}
                  alt="iphone14"
                  style={{
                    width: '450px',
                    height: '320px',
                    position: 'relative',
                    top: '24px',
                  }}
                />
              </div>
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default Promotional;
