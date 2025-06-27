import ps5 from '../../../assets/images/ps5-slim.png';
import womanHat from '../../../assets/images/attractive-woman-wearing-hat.png';
import speakers from '../../../assets/images/amazon-echo-png-clipart.png';
import gucci from '../../../assets/images/gucci.png';
import SectionName from '../../../components/SectionName/SectionName';
import { useEffect, useState } from 'react';
import { getProducts } from '../../../api/products';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const NewArrival = () => {
  const [products, setProducts] = useState<any[]>([]);
  let index = 0;
  useEffect(() => {
    const getAllProducts = async () => {
      console.log('index: ' + index);
      index++;
      const response = await getProducts();
      const data = response.data as Array<any>;
      const productList = data
        .filter((prd) => prd.isNewArrival)
        .map((prd) => ({
          ...prd,
          image: `${API_URL}/public${prd.imageUrl}`,
          price: parseInt(prd.price),
        }))
        .reverse();
      console.log(productList);
      setProducts(productList);
      setTimeout(() => {
        console.log(products);
      }, 100);
    };
    getAllProducts();
  }, []);
  return (
    <div className="new-arrival">
      <div className="flex justify-between align-end">
        <div className="flex align-end">
          <div className="section-info-container">
            <SectionName title="Featured" />
            <div className="flash-sales-title">New Arrival</div>
          </div>
        </div>
      </div>
      <div className="new-arrival-layout grid grid-gap-2">
        <div className="new-arrival-item item1 position-center position-relative">
          <img
            src={products[0]?.image}
            alt={products[0]?.name}
            style={{
              width: '80%',
              height: 'auto',
            }}
          />
          <div className="flex flex-column flex-gap new-arrival-product-info">
            <div className="product-name">{products[0]?.name}</div>
            <div className="product-desc">{products[0]?.description}</div>
            <div className="buy-button-container">
              <button className="buy-button">Shop Now</button>
            </div>
          </div>
        </div>
        <div className="new-arrival-item item2 postition-right position-relative">
          <img
            src={products[1]?.image}
            alt={products[1]?.name}
            style={{
              width: 'auto',
              height: '80%',
            }}
          />
          <div className="flex flex-column flex-gap new-arrival-product-info">
            <div className="product-name">{products[1]?.name}</div>
            <div className="product-desc">{products[1]?.description}</div>
            <div className="buy-button-container">
              <button className="buy-button">Shop Now</button>
            </div>
          </div>
        </div>
        <div className="new-arrival-item item3 position-center position-relative">
          <img
            src={products[2]?.image}
            alt={products[2]?.name}
            style={{
              width: 'auto',
              height: '70%',
            }}
          />
          <div className="flex flex-column flex-gap new-arrival-product-info">
            <div className="product-name">{products[2]?.name}</div>
            <div className="product-desc">{products[2]?.description}</div>
            <div className="buy-button-container">
              <button className="buy-button">Shop Now</button>
            </div>
          </div>
        </div>
        <div className="new-arrival-item item4 position-center position-relative">
          <img
            src={products[3]?.image}
            alt={products[3]?.name}
            style={{
              width: 'auto',
              height: '70%',
            }}
          />
          <div className="flex flex-column flex-gap new-arrival-product-info">
            <div className="product-name">{products[3]?.name}</div>
            <div className="product-desc">{products[3]?.description}</div>
            <div className="buy-button-container">
              <button className="buy-button">Shop Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrival;
