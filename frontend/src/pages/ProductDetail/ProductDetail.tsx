import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ProductDetail.scss';
import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import controller1 from '../../assets/images/controller1.png';
import controller2 from '../../assets/images/controller2.jpg';
import controller3 from '../../assets/images/controller3.jpg';
import controller4 from '../../assets/images/controller4.jpg';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const images = [controller1, controller2, controller3, controller4];
  const [mainImage, setMainImage] = useState<string>(images[0]);
  useEffect(() => {
    console.log(productId);
  }, [productId]);
  return (
    <div className="product-detail-container flex-1">
      <div className="back-button">
        <Button type="default" className="back-btn">
          <LeftOutlined />
          Back
        </Button>
      </div>
      <div className="product-detail-content flex">
        <div className="product-detail-image grid flex-1">
          <div className="product-detail-image-list grid grid-gap">
            {images.map((image, index) => (
              <div
                key={index}
                className="product-detail-image-item"
                onClick={() => setMainImage(image)}
              >
                <img src={image} alt={`Product Image ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="product-detail-image-main flex justify-center align-center">
            <img src={mainImage} alt="Main Product Image" />
          </div>
          {/* <div className="product-detail-image-list grid grid-gap">
            {images.map((image, index) => (
              <div
                key={index}
                className="product-detail-image-item"
                onClick={() => setMainImage(image)}
              >
                <img src={image} alt={`Product Image ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="product-detail-image-main">
            <img src={mainImage} alt="Main Product Image" />
          </div> */}
        </div>
        <div className="product-detail-desc">Desc</div>
      </div>
    </div>
  );
};

export default ProductDetail;
