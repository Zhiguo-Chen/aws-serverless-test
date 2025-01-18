import { Card } from 'antd';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { useState } from 'react';
import ProductBrick from '../../components/ProductBrick/ProductBrick';

export interface Product {
  category_id?: number;
  createdAt?: Date;
  description?: string;
  id?: number;
  image: string;
  name: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  updatedAt?: Date;
  user_id?: string;
  score: number;
  Category?: {
    id: number;
    name: string;
  };
  reviews?: number;
}

const ListProducts = ({
  products,
  onProductClick,
}: {
  products: Array<Product>;
  onProductClick: (product: any) => void;
}) => {
  const [isGrid, setIsGrid] = useState(true);
  const gridStyle = {
    maxHeight: '270px',
    width: 'auto',
    maxWidth: '240px',
  };
  const listStyle = {
    maxHeight: '110px',
    width: 'auto',
  };
  return (
    <div>
      <div className="flex justify-end items-center padding-1 flex-gap">
        <BarsOutlined
          onClick={() => setIsGrid(false)}
          style={{
            fontSize: '24px',
            cursor: 'pointer',
            ...(!isGrid && { color: '#ff5000' }),
          }}
        />
        <AppstoreOutlined
          onClick={() => setIsGrid(true)}
          style={{
            fontSize: '24px',
            cursor: 'pointer',
            ...(isGrid && { color: '#ff5000' }),
          }}
        />
      </div>
      <ul
        className={
          isGrid
            ? 'grid auto-fit grid-gap padding-1'
            : 'flex flex-column flex-gap padding-1'
        }
      >
        {products.map((product: Product) => {
          return (
            <li
              key={product.id}
              style={{ height: isGrid ? '30rem' : '10rem' }}
              onClick={onProductClick}
            >
              {/* <Card style={{ width: '100%' }}>
                <div>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={isGrid ? gridStyle : listStyle}
                  />
                  {isGrid ?? <div>{product.name}</div>}
                </div>
              </Card> */}
              {/* {isGrid ? (
                <ProductBrick product={product} />
              ) : (
                <ProductItem product={product} />
              )} */}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ListProducts;
