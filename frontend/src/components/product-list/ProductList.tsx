import { useState } from 'react';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import ProductItem from '../../components/ProductItem/ProductItem';
import { ReactComponent as EyeIcon } from '../../assets/icons/eye.svg';
import { ReactComponent as WishlistIcon } from '../../assets/icons/Wishlist2.svg';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import './ProductList.scss';
import ProductListItem from '../../components/ProductListItem/ProductListItem';
import { Product } from '../../types/product';

const ProductList = ({
  productsList,
  onProductClick,
}: {
  productsList: Array<Product>;
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
    <div className="flex-1 product-list-container child-page-padding">
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[{ title: <Link to="/">Home</Link> }, { title: 'Cart' }]}
        />
      </div>
      <div className="flex justify-end items-center  flex-gap display-icon-container">
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
          isGrid ? 'grid auto-fit grid-gap-2' : 'flex flex-column flex-gap '
        }
      >
        {productsList.map((product: Product, index: number) =>
          isGrid ? (
            <ProductItem
              product={product}
              labelPlace={
                <label className="discount-info text-center">
                  {product.originalPrice && product.originalPrice > 0
                    ? -Math.ceil(
                        (1 - product.price / product.originalPrice) * 100,
                      ) + '%'
                    : ''}
                </label>
              }
              actionButtonPlace={
                <div className="action-button-container flex flex-column flex-gap-05">
                  <button>
                    <WishlistIcon />
                  </button>
                  <button>
                    <EyeIcon />
                  </button>
                </div>
              }
              isSocreShow={true}
              key={index}
            />
          ) : (
            <ProductListItem product={product} isSocreShow={true} key={index} />
          ),
        )}
      </ul>
    </div>
  );
};

export default ProductList;
