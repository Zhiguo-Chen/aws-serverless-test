import { ReactComponent as WishlistIcon } from '../../../assets/icons/Wishlist2.svg';
import { ReactComponent as EyeIcon } from '../../../assets/icons/eye.svg';
import ProductItem from '../../../components/ProductItem/ProductItem';
import SectionName from '../../../components/SectionName/SectionName';
import { Product, ProductsProps } from '../../../types/product';

const BestSelling = ({ prdouctList }: ProductsProps) => {
  return (
    <div className="categories-component-container">
      <div className="flex justify-between align-end">
        <div className="flex align-end">
          <div className="section-info-container">
            <SectionName title="This Month" />
            <div className="flash-sales-title">Best Selling Products</div>
          </div>
        </div>
        <div>
          <button className="view-all-btn">View All</button>
        </div>
      </div>
      <div className="flex flex-gap-2 sales-container">
        {prdouctList.map((product: Product, index: number) => (
          <ProductItem
            product={product}
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
    </div>
  );
};

export default BestSelling;
