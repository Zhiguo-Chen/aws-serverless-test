import { useEffect, useState } from 'react';
import { axiosInstance } from '../../auth/axiosInstance';
import { Card } from 'antd';

const ListProducts = ({
  products,
  onProductClick,
}: {
  products: any;
  onProductClick: (product: any) => void;
}) => {
  return (
    <ul className="grid auto-fit">
      {products.map((product: any) => {
        return (
          <li
            key={product.id}
            style={{ height: '20rem' }}
            onClick={onProductClick}
          >
            {/* <img
              src={product.image}
              alt={product.name}
              width={'100%'}
              height={'240px'}
            />
            <div>{product.name}</div> */}
            <Card style={{ width: '100%' }}>
              <img
                src={product.image}
                alt={product.name}
                width={'100%'}
                height={'240px'}
              />
              <p>{product.name}</p>
            </Card>
          </li>
        );
      })}
    </ul>
  );
};

export default ListProducts;
