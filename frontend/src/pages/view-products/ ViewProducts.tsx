import { useEffect, useState } from 'react';
import { getProducts } from '../../api/products';
import ProductList from '../product-list/ProductList';

const ViewProducts = () => {
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
