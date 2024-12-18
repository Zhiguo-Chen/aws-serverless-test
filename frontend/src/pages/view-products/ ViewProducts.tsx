import { useEffect, useState } from 'react';
import { axiosInstance } from '../../auth/axiosInstance';
import ListProducts from '../list-pruducts/List-Pruducts';

const ViewProducts = () => {
  const [products, setProducts] = useState<any>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching user info...');
        const response = await axiosInstance.get('/api/get-products');
        console.log(response.data);
        setProducts(response.data);
        setTimeout(() => {
          console.log(products);
        });
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
      <ListProducts
        products={products}
        onProductClick={handleProductClick}
      ></ListProducts>
    </div>
  );
};

export default ViewProducts;
