import { Carousel } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../../api/categories';
import { ReactComponent as AppleIcon } from '../../../assets/icons/Apple.svg';
import { ReactComponent as VectorIcon } from '../../../assets/icons/Vector2.svg';
import { Product, ProductsProps } from '../../../types/product';

const Promotional = ({ prdouctList }: ProductsProps) => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch categories from API or define them statically
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        console.log(data);
        setCategories(data);
        setTimeout(() => {
          console.log(categories);
        }, 100);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleClick = (productId: string) => {
    return () => {
      navigate(`/main/${productId}/product-detail`);
    };
  };

  return (
    <div className="promotional-container bottom-padding flex">
      <div className="promotional-categories">
        <ul className="flex flex-column flex-gap position-relative">
          {categories.map((category: any) => (
            <li key={category.id} className="category-item">
              {category.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="carousel-container flex-1">
        <Carousel autoplay>
          {prdouctList.map((product: Product) => (
            <div key={product.id}>
              <div className="flex car1-container">
                <div
                  className="flex-1 desc-container flex flex-column position-relative"
                  style={{ gap: '20px' }}
                >
                  <div className="flex align-center flex-gap-15">
                    <AppleIcon></AppleIcon>
                    <div className="regular-font">{product.name}</div>
                  </div>
                  <div
                    style={{
                      width: '294px',
                      fontSize: '48px',
                      fontWeight: 400,
                    }}
                  >
                    <div>Up to 10% off Voucher</div>
                  </div>
                  <div
                    className="show-now-button flex align-center flex-gap-05 cursor-pointer"
                    onClick={handleClick(product.id)}
                  >
                    <div className="light-font hover-underline">Show Now</div>
                    <VectorIcon></VectorIcon>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <img
                    src={product.primaryImageUrl}
                    alt={product.name}
                    style={{
                      maxHeight: '320px',
                      position: 'relative',
                      top: '24px',
                      maxWidth: '350px',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default Promotional;
