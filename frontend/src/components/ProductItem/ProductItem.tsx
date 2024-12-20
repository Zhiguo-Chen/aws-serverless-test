import React, { FC } from 'react';
import { Product } from '../../pages/list-pruducts/List-Pruducts';

interface ProductItemProps {
  product: Product;
}

const ProductItem: FC<ProductItemProps> = ({ product }) => (
  <div>ProductItem Component</div>
);

export default ProductItem;
