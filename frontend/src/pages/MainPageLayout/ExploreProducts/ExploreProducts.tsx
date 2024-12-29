import { ReactComponent as LeftArrowIcon } from '../../../assets/icons/Vector_left.svg';
import { ReactComponent as RightArrowIcon } from '../../../assets/icons/Vector_right.svg';
import doogFood from '../../../assets/images/DoogFood.png';
import eos250 from '../../../assets/images/eos-250d.png';
import ideapad from '../../../assets/images/ideapad-gaming-3i.png';
import curology from '../../../assets/images/curology-j7pKVQrTUsM.png';
import ElectricCar from '../../../assets/images/ElectricCar.png';
import SoccerCleats from '../../../assets/images/SoccerCleats.png';
import GamePad from '../../../assets/images/GamePad.png';
import Jacket from '../../../assets/images/Jacket.png';
import Icon, { StarFilled } from '@ant-design/icons';
import { ReactComponent as EyeIcon } from '../../../assets/icons/eye.svg';
import { ReactComponent as StarIcon } from '../../../assets/icons/Star.svg';
import { ReactComponent as WishlistIcon } from '../../../assets/icons/Wishlist2.svg';

const ExploreProducts = () => {
  const totalStars = 5;
  const productsList = [
    {
      image: doogFood,
      name: 'Breed Dry Dog Food',
      price: 100,
      oldPrice: 0,
      score: 3,
      reviews: 35,
    },
    {
      image: eos250,
      name: 'CANON EOS DSLR Camera',
      price: 360,
      oldPrice: 0,
      score: 4,
      reviews: 95,
    },
    {
      image: ideapad,
      name: 'ASUS FHD Gaming Laptop',
      price: 700,
      oldPrice: 0,
      score: 5,
      reviews: 325,
    },
    {
      image: curology,
      name: 'Curology Product Set',
      price: 500,
      oldPrice: 0,
      score: 4,
      reviews: 145,
    },
    {
      image: ElectricCar,
      name: 'Kids Electric Car',
      price: 960,
      oldPrice: 0,
      score: 5,
      reviews: 65,
    },
    {
      image: SoccerCleats,
      name: 'Jr. Zoom Soccer Cleats',
      price: 1160,
      oldPrice: 0,
      score: 5,
      reviews: 35,
    },
    {
      image: GamePad,
      name: 'GP11 Shooter USB Gamepad',
      price: 660,
      oldPrice: 0,
      score: 4,
      reviews: 55,
    },
    {
      image: Jacket,
      name: 'Quilted Satin Jacket',
      price: 660,
      oldPrice: 0,
      score: 4,
      reviews: 55,
    },
  ];
  return (
    <div className="explore-products">
      <div className="flex justify-between align-end">
        <div className="flex align-end">
          <div className="section-info-container">
            <div className="section-title-container flex align-center flex-gap">
              <div className="title-bar"></div>
              <div className="section-title">Our Products</div>
            </div>
            <div className="flash-sales-title">Explore Our Products</div>
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
      <div className="explore-products-sales-container">
        <div className="grid explore-auto-fit sales-container">
          {productsList.map((product: any, index: any) => (
            <div key={index} className="sales-item">
              <div className="image-bg flex justify-center align-center position-relative">
                <img src={product.image} alt={`Sale ${index}`} />
                {/* <label className="discount-info text-center">
                  -{Math.ceil((1 - product.price / product.oldPrice) * 100)}%
                </label> */}
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
      </div>
      <div className="flex justify-center full-width view-all-container">
        <button className="view-all-button">View All Products</button>
      </div>
    </div>
  );
};

export default ExploreProducts;
