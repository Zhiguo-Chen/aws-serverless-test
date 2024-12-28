import coat from '../../../assets/images/The-North-Face-x-Gucci-coat.png';
import bag from '../../../assets/images/Gucci-Savoy-medium-duffle-bag.png';
import cpu_cooler from '../../../assets/images/argb-1-500x500.png';
import bookself from '../../../assets/images/sam-moghadam-khamseh.png';
import Icon, { StarFilled } from '@ant-design/icons';
import { ReactComponent as WishlistIcon } from '../../../assets/icons/Wishlist2.svg';
import { ReactComponent as EyeIcon } from '../../../assets/icons/eye.svg';

const BestSelling = () => {
  const totalStars = 5;
  const productsList = [
    {
      image: coat,
      name: 'The north coat',
      price: 260,
      oldPrice: 360,
      score: 5,
      reviews: 88,
    },
    {
      image: bag,
      name: 'Gucci duffle bag',
      price: 960,
      oldPrice: 1160,
      score: 4,
      reviews: 75,
    },
    {
      image: cpu_cooler,
      name: 'RGB liquid CPU Cooler',
      price: 160,
      oldPrice: 170,
      score: 5,
      reviews: 99,
    },
    {
      image: bookself,
      name: 'Small BookSelf ',
      price: 360,
      oldPrice: 0,
      score: 4,
      reviews: 99,
    },
  ];
  return (
    <div className="categories-component-container">
      <div className="flex justify-between align-end">
        <div className="flex align-end">
          <div className="section-info-container">
            <div className="section-title-container flex align-center flex-gap">
              <div className="title-bar"></div>
              <div className="section-title">This Month</div>
            </div>
            <div className="flash-sales-title">Best Selling Products</div>
          </div>
        </div>
        <div>
          <button className="view-all-btn">View All</button>
        </div>
      </div>
      <div className="flex flex-gap-2 sales-container">
        {productsList.map((product: any, index: any) => (
          <div key={index} className="sales-item">
            <div className="image-bg flex justify-center align-center position-relative">
              <img src={product.image} alt={`Sale ${index}`} />
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
                {product.oldPrice > 0 && (
                  <div className="old-price">${product.oldPrice}</div>
                )}
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
  );
};

export default BestSelling;
