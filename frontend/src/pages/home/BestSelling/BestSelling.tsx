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
      <div className="grid auto-fit grid-gap-2 sales-container">
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
  );
};

export default BestSelling;
