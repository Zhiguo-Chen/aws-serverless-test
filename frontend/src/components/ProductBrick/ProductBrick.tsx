import React, { FC } from 'react';
import { Product } from '../../pages/list-pruducts/List-Pruducts';
import { Card, Tag } from 'antd';

interface ProductBrickProps {
  product: Product;
}

const ProductBrick: FC<ProductBrickProps> = ({ product }) => {
  const gridStyle = {
    maxHeight: '250px',
    width: 'auto',
    maxWidth: '250px',
  };
  return (
    <Card style={{ width: '100%', height: '100%' }}>
      <div className="flex flex-column flex-gap-05">
        <div className="text-center product-image-container">
          <img src={product.image} alt={product.name} style={gridStyle} />
        </div>
        <div className="product-bricks-name text-elipsis-2">{product.name}</div>
        <div className="product-bricks-price">${product.price}</div>
        <div>
          <Tag bordered={false} color="orange">
            {product.Category.name}
          </Tag>
        </div>
      </div>
    </Card>
  );
};

export default ProductBrick;
