import { ReactComponent as LeftArrowIcon } from '../../../assets/icons/Vector_left.svg';
import { ReactComponent as RightArrowIcon } from '../../../assets/icons/Vector_right.svg';
import ProductItem from '../../../components/ProductItem/ProductItem';
import SectionName from '../../../components/SectionName/SectionName';
import { Product, ProductsProps } from '../../../types/product';

const ExploreProducts = ({ prdouctList }: ProductsProps) => {
  return (
    <div className="explore-products">
      <div className="flex justify-between align-end">
        <div className="flex align-end">
          <div className="section-info-container">
            <SectionName title="Our Products" />
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
          {prdouctList.map((product: Product, index: number) => (
            <ProductItem
              product={product}
              actionButtonPlace={true}
              isSocreShow={true}
              key={index}
            />
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
