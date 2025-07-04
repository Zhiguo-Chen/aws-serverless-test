import chair from '../../assets/images/chair.png';
import controller from '../../assets/images/controller.png';
import keyBoard from '../../assets/images/keyBoard.png';
import monitor from '../../assets/images/monitor.png';
import { Product } from '../../types/product';
import { useEffect, useState } from 'react';
import { getProducts } from '../../api/products';
import ProductList from '../../components/product-list/ProductList';

const ByCategory = () => {
  const [productList, setProductList] = useState<Product[]>([]);
  const handleOnProductClick = (product: any) => {};
  useEffect(() => {
    const fetchData = async () => {
      const response = await getProducts();
      console.log(response.data);
      setProductList(response.data);
    };
    fetchData();
  }, []);
  return (
    <ProductList
      productsList={productList}
      onProductClick={handleOnProductClick}
    />
  );
};

export default ByCategory;
