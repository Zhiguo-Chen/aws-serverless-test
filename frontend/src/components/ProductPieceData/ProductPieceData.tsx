import { Product } from '../../types/product';
import './ProductPieceData.scss';
import { StarFilled } from '@ant-design/icons';

const ProductPieceData = ({ product }: { product: Product }) => {
  const totalStars = 5;
  return (
    <a className="product-piece-data" href={`/product-list/${product.id}`}>
      <div className="flex">
        <div className="product-piece-image-container flex-shrink-0 flex justify-center align-center position-relative">
          <img
            src={product.productImages[0].imageUrl}
            alt={product.name}
            className="product-piece-image"
          />
        </div>
        <div className="product-info-container flex-1">
          <div className="flex flex-column justify-between full-height">
            <div>
              <div className="product-info-name-container">{product.name}</div>
              <div className="product-description-container">
                {product.description}
              </div>
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
            </div>
            <div>
              <button
                className="add-to-cart-button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Add to cart');
                }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
        <div className="product-price-container flex-shrink-0 flex-grow-0 flex flex-column">
          <div className="price">${product.price}</div>
          <div className="old-price">${product.originalPrice}</div>
        </div>
      </div>
    </a>
  );
};

export default ProductPieceData;
