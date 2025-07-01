import { StarFilled } from '@ant-design/icons';
import React, { FC } from 'react';
import './ProductItem.scss';
import { Product } from '../../types/product';
import { addToCart } from '../../api/cart';
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
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // e.preventDefault();
    console.log(`Adding ${product.name} to cart`);
    const data = await addToCart({ productId: product.id, quantity: 1 });
    console.log('Add to cart response:', data);
  };
  return (
    <div className="sales-item">
      <div className="image-bg flex justify-center align-center position-relative">
        <img
          src={product.productImages && product.primaryImageUrl}
          alt={product.name}
          style={{ maxWidth: '270px', maxHeight: '90%' }}
        />
        {labelPlace && <>{labelPlace}</>}
        {actionButtonPlace && <>{actionButtonPlace}</>}
        <button className="add-to-cart" onClick={handleAddToCart}>
          Add To Cart
        </button>
      </div>
      <div className="product-info-container flex flex-column flex-gap-05">
        <div className="product-name-container">{product.name}</div>
        <div className="flex flex-gap-075">
          <div className="price">${product.price}</div>
          <div className="old-price">${product.originalPrice}</div>
        </div>
        {isSocreShow && (
          <div>
            {Array.from({ length: totalStars }, (_, index) => {
              if (product.averageRating && index < product.averageRating) {
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
  );
};

export default ProductItem;
