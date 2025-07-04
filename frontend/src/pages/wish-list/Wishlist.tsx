import './Wishlist.scss';
import bag from '../../assets/images/Gucci-Savoy-medium-duffle-bag.png';
import cpu_cooler from '../../assets/images/argb-1-500x500.png';
import GamePad from '../../assets/images/GamePad.png';
import Jacket from '../../assets/images/Jacket.png';
import ProductItem from '../../components/ProductItem/ProductItem';
import ideapad from '../../assets/images/ideapad-gaming-3i.png';
import controller from '../../assets/images/controller.png';
import keyBoard from '../../assets/images/keyBoard.png';
import monitor from '../../assets/images/monitor.png';
import SectionName from '../../components/SectionName/SectionName';
import { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import { getWishlist } from '../../api/wishlist';
import { API_URL } from '../../const/API_URL';

const Wishlist = () => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const recommendationProducts = [
    {
      image: ideapad,
      name: 'ASUS FHD Gaming Laptop',
      price: 700,
      oldPrice: 0,
      score: 5,
      reviews: 325,
    },
    {
      image: monitor,
      name: 'IPS LCD Gaming Monitor',
      price: 370,
      oldPrice: 400,
      score: 5,
      reviews: 99,
    },
    {
      image: controller,
      name: 'HAVIT HV-G92 Gamepad',
      price: 120,
      oldPrice: 160,
      score: 5,
      reviews: 88,
    },
    {
      image: keyBoard,
      name: 'AK-900 Wired Keyboard',
      price: 960,
      oldPrice: 1160,
      score: 4,
      reviews: 75,
    },
  ];
  useEffect(() => {
    const listWishlist = async () => {
      try {
        const response = await getWishlist();
        console.log('Wishlist fetched:', response.data);
        setProductsList(
          response.data?.map((item: any) => {
            const primaryImage = item.product?.productImages.find(
              (img: any) => img.isPrimary,
            );
            item.product.primaryImageUrl =
              `${API_URL}/public${primaryImage?.imageUrl}` || '';
            return item.product;
          }),
        );
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };
    listWishlist();
  }, []);
  return (
    <div className="wishlist-page child-page-padding flex flex-column flex-1">
      <div className="wishlist-page-container flex flex-column">
        <div className="wishlist-page-title flex justify-between align-center">
          <div>Wishlist ({productsList.length})</div>
          <button>Move All To Bag</button>
        </div>
        <div className="wishlist-page-content">
          {productsList.map((product: Product, index: any) => (
            <ProductItem
              product={product}
              {...(product.originalPrice > 0
                ? {
                    labelPlace: (
                      <label className="discount-info text-center">
                        {product.originalPrice && product.originalPrice > 0
                          ? -Math.ceil(
                              (1 - product.price / product.originalPrice) * 100,
                            ) + '%'
                          : ''}
                      </label>
                    ),
                  }
                : {})}
              key={index}
            />
          ))}
        </div>
      </div>
      <div className="recommendation-container flex flex-column">
        <div className="flex justify-between align-center">
          <SectionName title="Recommended" />
          <button className="view-all-btn">See All</button>
        </div>
        <div className="wishlist-page-content">
          {recommendationProducts.map((product: any, index: any) => (
            <ProductItem
              product={product}
              {...(product.oldPrice > 0
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
              isSocreShow={true}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
