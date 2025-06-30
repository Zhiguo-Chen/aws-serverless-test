import { message } from 'antd';
import { useEffect, useState } from 'react';
import { getProducts } from '../../../api/products';
import { ReactComponent as WishlistIcon } from '../../../assets/icons/Wishlist2.svg';
import { ReactComponent as EyeIcon } from '../../../assets/icons/eye.svg';
import bag from '../../../assets/images/Gucci-Savoy-medium-duffle-bag.png';
import coat from '../../../assets/images/The-North-Face-x-Gucci-coat.png';
import cpu_cooler from '../../../assets/images/argb-1-500x500.png';
import bookself from '../../../assets/images/sam-moghadam-khamseh.png';
import ProductItem from '../../../components/ProductItem/ProductItem';
import SectionName from '../../../components/SectionName/SectionName';
import { Product, ProductsProps } from '../../../types/product';

const BestSelling = ({ prdouctList }: ProductsProps) => {
  const totalStars = 5;
  const productsList = [
    {
      image: coat,
      name: 'The north coat',
      price: 260,
      oldPrice: 360,
      score: 5,
      reviews: 88,
    },
    {
      image: bag,
      name: 'Gucci duffle bag',
      price: 960,
      oldPrice: 1160,
      score: 4,
      reviews: 75,
    },
    {
      image: cpu_cooler,
      name: 'RGB liquid CPU Cooler',
      price: 160,
      oldPrice: 170,
      score: 5,
      reviews: 99,
    },
    {
      image: bookself,
      name: 'Small BookSelf ',
      price: 360,
      oldPrice: 0,
      score: 4,
      reviews: 99,
    },
  ];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {}, []);

  // const fetchProducts = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await getProducts();
  //     console.log(response.data);
  //     setProducts(response.data);
  //   } catch (error) {
  //     message.error('Failed to fetch products');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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
      <div className="flex flex-gap-2 sales-container">
        {prdouctList.map((product: Product, index: number) => (
          <ProductItem
            product={product}
            actionButtonPlace={
              <div className="action-button-container flex flex-column flex-gap-05">
                <button>
                  <WishlistIcon />
                </button>
                <button>
                  <EyeIcon />
                </button>
              </div>
            }
            isSocreShow={true}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSelling;
