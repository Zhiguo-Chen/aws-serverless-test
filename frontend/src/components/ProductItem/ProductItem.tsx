import { HeartFilled, HeartOutlined, StarFilled } from '@ant-design/icons';
import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../api/cart';
import { Product } from '../../types/product';
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
  const navigate = useNavigate();
  const totalStars = 5;
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // e.preventDefault();
    console.log(`Adding ${product.name} to cart`);
    const data = await addToCart({ productId: product.id, quantity: 1 });
    console.log('Add to cart response:', data);
  };

  const handleProductClick = () => {
    navigate(`/main/${product.id}/product-detail`);
  };

  const [isFavorite, setIsFavorite] = React.useState(false);
  const handleAdd2Favorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
    // 可在此处调用后端API
    console.log(`Toggled favorite for ${product.name}`);
  };

  return (
    <div className="sales-item">
      <a
        className="image-bg flex justify-center align-center position-relative"
        onClick={handleProductClick}
      >
        <img
          src={product.productImages && product.primaryImageUrl}
          alt={product.name}
          style={{ maxWidth: '270px', maxHeight: '90%' }}
        />
        {labelPlace && <>{labelPlace}</>}
        {actionButtonPlace && (
          <div className="action-button-container flex flex-column flex-gap-05">
            <button onClick={handleAdd2Favorite}>
              {isFavorite ? (
                <HeartFilled style={{ color: '#db4444' }} />
              ) : (
                <HeartOutlined />
              )}
            </button>
          </div>
        )}
        <button className="add-to-cart" onClick={handleAddToCart}>
          Add To Cart
        </button>
      </a>
      <div className="product-info-container flex flex-column flex-gap-05">
        <div className="product-name-container text-elipsis-1">
          {product.name}
        </div>
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
