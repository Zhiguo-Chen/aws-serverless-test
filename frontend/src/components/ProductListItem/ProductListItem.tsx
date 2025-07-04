import { StarFilled } from '@ant-design/icons';
import React, { FC } from 'react';
import './ProductListItem.scss';
import { Product } from '../../types/product';

interface ProductItemProps {
  product: Product;
  labelPlace?: React.ReactNode;
  actionButtonPlace?: React.ReactNode;
  isSocreShow?: boolean;
}
const ProductListItem: FC<ProductItemProps> = ({
  product,
  labelPlace,
  actionButtonPlace,
  isSocreShow = false,
}) => {
  const totalStars = 5;
  return (
    <a>
      <div className="flex flex-gap list-item-container">
        <div className="list-item-img-container image-bg flex justify-center align-center position-relative">
          <img
            src={product.productImages && product.primaryImageUrl}
            alt={product.name}
          />
          {labelPlace && <>{labelPlace}</>}
          {actionButtonPlace && <>{actionButtonPlace}</>}
          <button className="add-to-cart">Add To Cart</button>
        </div>
        <div className="flex-1">
          <div className="product-info-detail-container flex flex-column flex-gap-05">
            <div className="product-bricks-price">{product.name}</div>
            <div className="product-item-desc text-elipsis-3">
              {product.description}
            </div>
            <div>
              {isSocreShow && (
                <div>
                  {Array.from({ length: totalStars }, (_, index) => {
                    if (
                      product.averageRating &&
                      index < product.averageRating
                    ) {
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
                  <span className="reviews">({product.reviewCount})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="price-info-container text-end">
          <div className="price">${product.price}</div>
          <div className="old-price">${product.originalPrice}</div>
        </div>
      </div>
    </a>
  );
};

export default ProductListItem;
