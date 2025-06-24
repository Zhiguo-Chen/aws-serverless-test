import { useEffect, useState } from 'react';
import { getProducts } from '../../api/products';
import cpu_cooler from '../../assets/images/argb-1-500x500.png';
import GamePad from '../../assets/images/GamePad.png';
import bag from '../../assets/images/Gucci-Savoy-medium-duffle-bag.png';
import Jacket from '../../assets/images/Jacket.png';
import ProductList from '../ProductList/ProductList';

const ViewProducts = () => {
  const productsList = [
    {
      image: bag,
      name: 'Gucci duffle bag',
      description: 'A duffle bag with a gold color and a gold chain',
      price: 960,
      oldPrice: 1160,
      score: 5,
      reviewCount: 88,
      averageRating: 3,
      id: 1,
    },
    {
      image: cpu_cooler,
      name: 'RGB liquid CPU Cooler',
      description: 'A RGB liquid CPU cooler with a gold color',
      price: 1960,
      oldPrice: 0,
      score: 4,
      reviewCount: 75,
      averageRating: 4,
      id: 2,
    },
    {
      image: GamePad,
      name: 'GP11 Shooter USB Gamepad',
      description: 'A USB gamepad with a gold color',
      price: 550,
      oldPrice: 0,
      score: 5,
      reviewCount: 99,
      averageRating: 2,
      id: 3,
    },
    {
      image: Jacket,
      name: 'Quilted Satin Jacket',
      description: 'A satin jacket with a gold color',
      price: 750,
      oldPrice: 0,
      score: 4,
      reviewCount: 99,
      averageRating: 3,
      id: 4,
    },
    {
      image: GamePad,
      name: 'GP11 Shooter USB Gamepad',
      description: 'A USB gamepad with a gold color',
      price: 550,
      oldPrice: 0,
      score: 5,
      reviewCount: 99,
      averageRating: 4,
      id: 5,
    },
    {
      image: Jacket,
      name: 'Quilted Satin Jacket',
      description: 'A satin jacket with a gold color',
      price: 750,
      oldPrice: 0,
      score: 4,
      reviewCount: 99,
      averageRating: 3,
      id: 6,
    },
  ];
  const [products, setProducts] = useState<any>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching user info...');
        const response = await getProducts();
        console.log(response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchData();
  }, []);
  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
  }; // Add any additional logic you want to handle here };
  return (
    <div className="list-page-padding">
      <ProductList
        productsList={products}
        onProductClick={handleProductClick}
      ></ProductList>
    </div>
  );
};

export default ViewProducts;
