import './WishlistPage.scss';
import bag from '../../assets/images/Gucci-Savoy-medium-duffle-bag.png';
import cpu_cooler from '../../assets/images/argb-1-500x500.png';
import GamePad from '../../assets/images/GamePad.png';
import Jacket from '../../assets/images/Jacket.png';
import ProductItem from '../../components/ProductItem/ProductItem';
import ideapad from '../../assets/images/ideapad-gaming-3i.png';
import controller from '../../assets/images/controller.png';
import keyBoard from '../../assets/images/keyBoard.png';
import monitor from '../../assets/images/monitor.png';
import SectionName from '../../components/SectionName/SectionName';

const WishlistPage = () => {
  const productsList = [
    {
      image: bag,
      name: 'Gucci duffle bag',
      price: 960,
      oldPrice: 1160,
      score: 5,
      reviews: 88,
    },
    {
      image: cpu_cooler,
      name: 'RGB liquid CPU Cooler',
      price: 1960,
      oldPrice: 0,
      score: 4,
      reviews: 75,
    },
    {
      image: GamePad,
      name: 'GP11 Shooter USB Gamepad',
      price: 550,
      oldPrice: 0,
      score: 5,
      reviews: 99,
    },
    {
      image: Jacket,
      name: 'Quilted Satin Jacket',
      price: 750,
      oldPrice: 0,
      score: 4,
      reviews: 99,
    },
    {
      image: GamePad,
      name: 'GP11 Shooter USB Gamepad',
      price: 550,
      oldPrice: 0,
      score: 5,
      reviews: 99,
    },
    {
      image: Jacket,
      name: 'Quilted Satin Jacket',
      price: 750,
      oldPrice: 0,
      score: 4,
      reviews: 99,
    },
  ];
  const recommendationProducts = [
    {
      image: ideapad,
      name: 'ASUS FHD Gaming Laptop',
      price: 700,
      oldPrice: 0,
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
  return (
    <div className="wishlist-page flex flex-column flex-1">
      <div className="wishlist-page-container flex flex-column">
        <div className="wishlist-page-title flex justify-between align-center">
          <div>Wishlist ({productsList.length})</div>
          <button>Move All To Bag</button>
        </div>
        <div className="wishlist-page-content">
          {productsList.map((product: any, index: any) => (
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
              key={index}
            />
          ))}
        </div>
      </div>
      <div className="recommendation-container flex flex-column">
        <div className="flex justify-between align-center">
          <SectionName title="Recommended" />
          <button className="view-all-btn">See All</button>
        </div>
        <div className="wishlist-page-content">
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

export default WishlistPage;
