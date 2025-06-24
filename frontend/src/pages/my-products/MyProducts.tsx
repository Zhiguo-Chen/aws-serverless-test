import { useEffect, useState } from 'react';
import { axiosInstance } from '../../auth/axiosInstance';
import { Product } from '../../types/product';
import ProductList from '../ProductList/ProductList';

const MyProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/api/get-my-products');
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
    <div>
      <ProductList
        productsList={products}
        onProductClick={handleProductClick}
      ></ProductList>
    </div>
  );
};

export default MyProducts;
