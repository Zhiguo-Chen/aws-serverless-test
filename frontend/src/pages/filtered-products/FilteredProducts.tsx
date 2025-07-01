import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { searchByCategory, searchProduct } from '../../api/products';
import ProductList from '../../components/product-list/ProductList';
import { Product } from '../../types/product';
import { processProduct } from '../../utils/processProduct';

const FilteredProducts = () => {
  const location = useLocation();
  const { category } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const searchStr = searchParams.get('searchStr') || '';
  console.log('Search String:', searchStr);
  console.log('Category:', category);
  useEffect(() => {
    const searchData = async () => {
      if (!searchStr && !category) {
        setProducts([]);
        return;
      }
      try {
        let response;
        if (category) {
          response = await searchByCategory(category);
        } else {
          response = await searchProduct(searchStr);
        }
        console.log('Search Results:', response.data);
        setProducts(processProduct(response.data));
      } catch (error) {
        setProducts([]);
      }
    };
    searchData();
  }, [searchStr, category]);
  const [products, setProducts] = useState<Product[]>([]);
  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
  }; // Add any additional logic you want to handle here };
  return (
    <div
      className={
        'list-page-padding flex-1' +
        (!products || products.length === 0 ? 'flex' : '')
      }
    >
      {!products || products.length === 0 ? (
        <div className="center-container-element flex-1">
          <div
            style={{
              color: '#ff5000',
              fontWeight: 'bold',
              fontSize: 24,
              textAlign: 'center',
              margin: '40px 0',
            }}
          >
            No available products now!
          </div>
        </div>
      ) : (
        <ProductList
          productsList={products}
          onProductClick={handleProductClick}
        ></ProductList>
      )}
    </div>
  );
};

export default FilteredProducts;
