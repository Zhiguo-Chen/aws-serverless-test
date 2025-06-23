import { Card } from 'antd';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { useState } from 'react';
import ProductBrick from '../../components/ProductBrick/ProductBrick';
import ProductItem from '../../components/ProductItem/ProductItem';
import ProductPieceData from '../../components/ProductPieceData/ProductPieceData';

export interface Product {
  category_id?: number;
  createdAt?: Date;
  description?: string;
  id?: number;
  image: string;
  name: string;
  price: number;
  oldPrice?: number;
  originalPrice?: number;
  stock?: number;
  updatedAt?: Date;
  user_id?: string;
  score: number;
  averageRating?: number;
  Category?: {
    id: number;
    name: string;
  };
  reviews?: number;
  reviewCount?: number;
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
            ? 'grid auto-fit grid-gap-2 padding-1'
            : 'flex flex-column flex-gap padding-1'
        }
      >
        {products.map((product: Product, index: number) => {
          return (
            <li key={product.id} onClick={onProductClick}>
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
              {isGrid ? (
                <ProductItem
                  product={product}
                  {...(product.oldPrice !== undefined && product.oldPrice > 0
                    ? {
                        labelPlace: (
                          <label className="discount-info text-center">
                            {product.oldPrice && product.oldPrice > 0
                              ? -Math.ceil(
                                  (1 - product.price / product.oldPrice) * 100,
                                ) + '%'
                              : ''}
                          </label>
                        ),
                      }
                    : {})}
                  key={index}
                />
              ) : (
                <ProductPieceData product={product} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ListProducts;
