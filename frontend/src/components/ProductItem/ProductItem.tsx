import { StarFilled } from '@ant-design/icons';
import React, { FC } from 'react';
import { Product } from '../../pages/list-pruducts/List-Pruducts';
import './ProductItem.scss';
interface ProductItemProps {
  product: Product;
  labelPlace?: React.ReactNode;
  actionButtonPlace?: React.ReactNode;
  isSocreShow?: boolean;
}

const ProductItem: FC<ProductItemProps> = ({
  product,
  labelPlace,
  actionButtonPlace,
  isSocreShow = false,
}) => {
  const totalStars = 5;
  return (
    <div className="sales-item">
      <div className="image-bg flex justify-center align-center position-relative">
        <img src={product.image} alt={product.name} />
        {labelPlace && <>{labelPlace}</>}
        {actionButtonPlace && <>{actionButtonPlace}</>}
        <button className="add-to-cart">Add To Cart</button>
      </div>
      <div className="product-info-container flex flex-column flex-gap-05">
        <div className="product-name-container">{product.name}</div>
        <div className="flex flex-gap-075">
          <div className="price">${product.price}</div>
          <div className="old-price">${product.oldPrice}</div>
        </div>
        {isSocreShow && (
          <div>
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
            <span className="reviews">({product.reviews})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductItem;
