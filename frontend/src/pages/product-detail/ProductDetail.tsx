import {
  HeartFilled,
  HeartOutlined,
  LeftOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addToCart } from '../../api/cart';
import { getProductById } from '../../api/products';
import { getRecommendations } from '../../api/recommendation';
import { ReactComponent as DeliveryIcon } from '../../assets/icons/icon-delivery_2.svg';
import { ReactComponent as ReturnIcon } from '../../assets/icons/Icon-return.svg';
import ProductItem from '../../components/ProductItem/ProductItem';
import SectionName from '../../components/SectionName/SectionName';
import { API_URL } from '../../const/API_URL';
import { Product, ProductImage } from '../../types/product';
import { processProduct } from '../../utils/processProduct';
import './ProductDetail.scss';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [recommendationProducts, setRecommendationProducts] = useState<
    Product[]
  >([]);
  const [activeColor, setActiveColor] = useState<string>('');
  const [activeSize, setActiveSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const colors = ['Red', 'Blue', 'Green', 'Yellow'];
  const sizes = ['S', 'M', 'L', 'XL'];

  const navigate = useNavigate();
  const totalStars = 5;

  const [mainImage, setMainImage] = useState<ProductImage | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  useEffect(() => {
    // 页面加载或 productId 变化时自动滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getProdustDetail();
    getRecomProducts();
  }, [productId]);

  const getProdustDetail = async () => {
    const { data } = await getProductById(productId);
    setProductDetail(data);
    const primaryImage = data.productImages.find(
      (image: ProductImage) => image.isPrimary,
    );
    setMainImage(primaryImage);
    console.log(data);
  };

  const getRecomProducts = async () => {
    if (!productId) return;
    const data = await getRecommendations(productId);
    if (!data || data.length === 0) {
      console.log('No recommendations found for this product.');
      return;
    }
    setRecommendationProducts(processProduct(data));
    console.log('Recommendations:', data);
  };
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlShowFullDesc = () => {
    setShowFullDesc((prev) => !prev);
  };

  const handleBuyNow = async () => {
    if (!productDetail) return;
    const data = await addToCart({ productId: productDetail?.id, quantity: 1 });
    navigate('/main/cart');
  };
  return (
    <div className="product-detail-container flex-1">
      <div className="back-button">
        <Button type="default" className="back-btn" onClick={handleBack}>
          <LeftOutlined />
          Back
        </Button>
      </div>
      <div className="product-detail-content flex">
        <div className="product-detail-image grid flex-1">
          <div className="product-detail-image-list grid grid-gap">
            {productDetail?.productImages.map(
              (image: ProductImage, index: number) => (
                <div
                  key={index}
                  className={`product-detail-image-item${
                    mainImage?.imageUrl === image.imageUrl ? ' selected' : ''
                  }`}
                  onMouseEnter={() => setMainImage(image)}
                >
                  <img
                    src={`${API_URL}/public${image?.imageUrl}`}
                    alt={`Product Image ${index + 1}`}
                  />
                </div>
              ),
            )}
          </div>
          <div className="product-detail-image-main flex justify-center align-center position-relative">
            <img
              src={`${API_URL}/public${mainImage?.imageUrl}`}
              alt="Main Product Image"
            />
          </div>
        </div>
        <div className="product-detail-desc flex flex-column flex-gap-15">
          <div className="product-base-info flex flex-column flex-gap">
            <div className="font-size-large">{productDetail?.name}</div>
            <div className="flex align-center">
              <div className="star-container ">
                {Array.from({ length: totalStars }, (_, index) => {
                  if (
                    productDetail?.averageRating &&
                    index < productDetail?.averageRating
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
                ({productDetail?.reviewCount} reviews)
              </div>
              <div className="product-sales-state">In Stock</div>
            </div>
            <div className="font-size-large font-weight-lighter">
              ${productDetail?.price}
            </div>
          </div>
          <div className={`product-desc font-size-small font-weight-lighter`}>
            <div className={`${showFullDesc ? '' : ' text-elipsis-3'}`}>
              {productDetail?.description}
            </div>
            {productDetail?.description &&
              productDetail?.description.length > 150 && (
                <div
                  className="show-more-btn"
                  style={{ color: '#1677ff', cursor: 'pointer', marginLeft: 8 }}
                  onClick={handlShowFullDesc}
                >
                  {showFullDesc ? 'Show Less' : 'Show More'}
                </div>
              )}
          </div>
          <div className="product-divider divider"></div>
          <div className="product-colors-options flex flex-gap-15 align-center">
            <div className="font-size-small font-weight-lighter">Colors: </div>
            <div className="product-colors-list flex flex-gap-05">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`product-color-item ${
                    activeColor === color ? 'active' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                ></div>
              ))}
            </div>
          </div>
          <div className="product-size-options flex flex-gap-15 align-center">
            <div>Size:</div>
            <div className="flex flex-gap-05 justify-center align-center">
              {sizes.map((size, index) => (
                <div
                  key={index}
                  className={`product-size-item text-center cursor-pointer ${
                    activeSize === size ? 'active' : ''
                  }`}
                  onClick={() => setActiveSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
          <div className="product-buy-actions flex flex-gap align-center">
            <div className="quantity-input full-height flex align-center">
              <button
                className="quantity-btn full-height minus"
                onClick={handleDecrease}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                className="full-height border-box text-center"
              />
              <button
                className="quantity-btn full-height plus"
                onClick={handleIncrease}
              >
                +
              </button>
            </div>

            <button className="buy-now-btn full-height" onClick={handleBuyNow}>
              Buy Now
            </button>

            <button
              className={`wishlist-btn full-height ${
                isFavorite ? 'active' : ''
              }`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              {isFavorite ? (
                <HeartFilled style={{ fontSize: '20px', color: '#db4444' }} />
              ) : (
                <HeartOutlined style={{ fontSize: '20px' }} />
              )}
            </button>
          </div>
          <div className="product-benefits  full-width border-box flex flex-column">
            <div className="flex-1 flex flex-gap align-center product-benefits-info-container">
              <DeliveryIcon />
              <div className="flex flex-column flex-gap-05">
                <div>Free Delivery</div>
                <div className="product-benefits-info-desc">
                  Enter your postal code for Delivery Availability
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-gap align-center product-benefits-info-container">
              <ReturnIcon />
              <div className="flex flex-column flex-gap-05">
                <div>Return Delivery</div>
                <div className="product-benefits-info-desc">
                  Free 30 Days Delivery Returns. Details
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {recommendationProducts.length > 0 && (
        <div className="product-related-items-container flex flex-column">
          <SectionName title="Related Item" />
          <div className="product-related-items">
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
      )}
    </div>
  );
};

export default ProductDetail;
