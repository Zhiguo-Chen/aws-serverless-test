import chair from '../../assets/images/chair.png';
import controller from '../../assets/images/controller.png';
import keyBoard from '../../assets/images/keyBoard.png';
import monitor from '../../assets/images/monitor.png';
import ProductList from '../ProductList/ProductList';

const ByCategory = () => {
  const productsList = [
    {
      image: controller,
      name: 'HAVIT HV-G92 Gamepad',
      price: 120,
      oldPrice: 160,
      score: 5,
      reviews: 88,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quia.',
    },
    {
      image: keyBoard,
      name: 'AK-900 Wired Keyboard',
      price: 960,
      oldPrice: 1160,
      score: 4,
      reviews: 75,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quia.',
    },
    {
      image: monitor,
      name: 'IPS LCD Gaming Monitor',
      price: 370,
      oldPrice: 400,
      score: 5,
      reviews: 99,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quia.',
    },
    {
      image: chair,
      name: 'S-Series Comfort Chair ',
      price: 375,
      oldPrice: 400,
      score: 4,
      reviews: 99,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quia.',
    },
  ];
  const handleOnProductClick = (product: any) => {};
  return (
    <ProductList
      productsList={productsList}
      onProductClick={handleOnProductClick}
    />
  );
};

export default ByCategory;
