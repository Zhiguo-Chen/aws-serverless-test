import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProductDetail.scss';
import { Button } from 'antd';
import {
  LeftOutlined,
  StarFilled,
  HeartFilled,
  HeartOutlined,
} from '@ant-design/icons';
import { ReactComponent as DeliveryIcon } from '../../assets/icons/icon-delivery_2.svg';
import { ReactComponent as ReturnIcon } from '../../assets/icons/Icon-return.svg';
import controller1 from '../../assets/images/controller1.jpg';
import controller2 from '../../assets/images/controller2.jpg';
import controller3 from '../../assets/images/controller3.jpg';
import controller4 from '../../assets/images/controller4.jpg';
import SectionName from '../../components/SectionName/SectionName';
import bag from '../../assets/images/Gucci-Savoy-medium-duffle-bag.png';
import cpu_cooler from '../../assets/images/argb-1-500x500.png';
import GamePad from '../../assets/images/GamePad.png';
import Jacket from '../../assets/images/Jacket.png';
import ProductItem from '../../components/ProductItem/ProductItem';
import ideapad from '../../assets/images/ideapad-gaming-3i.png';
import controller from '../../assets/images/controller.png';
import keyBoard from '../../assets/images/keyBoard.png';
import monitor from '../../assets/images/monitor.png';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [activeColor, setActiveColor] = useState<string>('');
  const [activeSize, setActiveSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const navigate = useNavigate();
  const product = {
    image: controller1,
    name: 'HAVIT HV-G92 Gamepad',
    price: 120,
    oldPrice: 160,
    score: 4,
    reviews: 88,
    desc: 'PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy bubble free install & mess free removal Pressure sensitive.',
    colors: ['Red', 'Blue', 'Green', 'Yellow'],
    sizes: ['S', 'M', 'L', 'XL'],
  };
  const totalStars = 5;
  const recommendationProducts = [
    {
      image: ideapad,
      name: 'ASUS FHD Gaming Laptop',
      price: 700,
      oldPrice: 800,
      score: 5,
      reviews: 325,
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
  ];

  const images = [controller1, controller2, controller3, controller4];
  const [mainImage, setMainImage] = useState<string>(images[0]);
  useEffect(() => {
    console.log(productId);
  }, [productId]);
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };
  return (
    <div className="product-detail-container flex-1">
      <div className="back-button">
        <Button type="default" className="back-btn">
          <LeftOutlined />
          Back
        </Button>
      </div>
      <div className="product-detail-content flex">
        <div className="product-detail-image grid flex-1">
          <div className="product-detail-image-list grid grid-gap">
            {images.map((image, index) => (
              <div
                key={index}
                className="product-detail-image-item"
                onClick={() => setMainImage(image)}
              >
                <img src={image} alt={`Product Image ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="product-detail-image-main flex justify-center align-center position-relative">
            <img src={mainImage} alt="Main Product Image" />
          </div>
          {/* <div className="product-detail-image-list grid grid-gap">
            {images.map((image, index) => (
              <div
                key={index}
                className="product-detail-image-item"
                onClick={() => setMainImage(image)}
              >
                <img src={image} alt={`Product Image ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="product-detail-image-main">
            <img src={mainImage} alt="Main Product Image" />
          </div> */}
        </div>
        <div className="product-detail-desc flex flex-column flex-gap-15">
          <div className="product-base-info flex flex-column flex-gap">
            <div className="font-size-large">{product.name}</div>
            <div className="flex align-center">
              <div className="star-container ">
                {Array.from({ length: totalStars }, (_, index) => {
                  if (product.score && index < product.score) {
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
                ({product.reviews} reviews)
              </div>
              <div className="product-sales-state">In Stock</div>
            </div>
            <div className="font-size-large font-weight-lighter">
              ${product.price}
            </div>
          </div>
          <div className="product-desc font-size-small font-weight-lighter">
            {product.desc}
          </div>
          <div className="product-divider divider"></div>
          <div className="product-colors-options flex flex-gap-15 align-center">
            <div className="font-size-small font-weight-lighter">Colors: </div>
            <div className="product-colors-list flex flex-gap-05">
              {product.colors.map((color, index) => (
                <div
                  key={index}
                  className={`product-color-item ${
                    activeColor === color ? 'active' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                ></div>
              ))}
            </div>
          </div>
          <div className="product-size-options flex flex-gap-15 align-center">
            <div>Size:</div>
            <div className="flex flex-gap-05 justify-center align-center">
              {product.sizes.map((size, index) => (
                <div
                  key={index}
                  className={`product-size-item text-center cursor-pointer ${
                    activeSize === size ? 'active' : ''
                  }`}
                  onClick={() => setActiveSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
          <div className="product-buy-actions flex flex-gap align-center">
            <div className="quantity-input full-height flex align-center">
              <button
                className="quantity-btn full-height minus"
                onClick={handleDecrease}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                className="full-height border-box text-center"
              />
              <button
                className="quantity-btn full-height plus"
                onClick={handleIncrease}
              >
                +
              </button>
            </div>

            <button className="buy-now-btn full-height">Buy Now</button>

            <button
              className={`wishlist-btn full-height ${
                isFavorite ? 'active' : ''
              }`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              {isFavorite ? (
                <HeartFilled style={{ fontSize: '20px', color: '#db4444' }} />
              ) : (
                <HeartOutlined style={{ fontSize: '20px' }} />
              )}
            </button>
          </div>
          <div className="product-benefits full-height full-width border-box flex flex-column">
            <div className="flex-1 flex flex-gap align-center product-benefits-info-container">
              <DeliveryIcon />
              <div className="flex flex-column flex-gap-05">
                <div>Free Delivery</div>
                <div className="product-benefits-info-desc">
                  Enter your postal code for Delivery Availability
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-gap align-center product-benefits-info-container">
              <ReturnIcon />
              <div className="flex flex-column flex-gap-05">
                <div>Return Delivery</div>
                <div className="product-benefits-info-desc">
                  Free 30 Days Delivery Returns. Details
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="product-related-items-container flex flex-column">
        <SectionName title="Related Item" />
        <div className="product-related-items">
          {recommendationProducts.map((product: any, index: any) => (
            <ProductItem
              product={product}
              {...(product.oldPrice > 0
                ? {
                    labelPlace: (
                      <label className="discount-info text-center">
                        {product.oldPrice && product.oldPrice > 0
                          ? -Math.ceil(
                              (1 - product.price / product.oldPrice) * 100,
                            ) + '%'
                          : ''}
                      </label>
                    ),
                  }
                : {})}
              isSocreShow={true}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
