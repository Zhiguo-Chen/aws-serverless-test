import ps5 from '../../../assets/images/ps5-slim.png';
import womanHat from '../../../assets/images/attractive-woman-wearing-hat.png';
import speakers from '../../../assets/images/amazon-echo-png-clipart.png';
import gucci from '../../../assets/images/gucci.png';

const NewArrival = () => {
  const product1 = {
    id: 1,
    name: 'PlayStation 5',
    image: ps5,
    desc: 'Black and White version of the PS5 coming out on sale.',
  };
  const product2 = {
    id: 2,
    name: 'Women’s Collections',
    image: womanHat,
    desc: 'Featured woman collections that give you another vibe.',
  };
  const product3 = {
    id: 3,
    name: 'Speakers',
    image: speakers,
    desc: 'Amazon wireless speakers.',
  };
  const product4 = {
    id: 4,
    name: 'Perfume',
    image: gucci,
    desc: 'GUCCI INTENSE OUD EDP.',
  };
  return (
    <div className="new-arrival">
      <div className="flex justify-between align-end">
        <div className="flex align-end">
          <div className="section-info-container">
            <div className="section-title-container flex align-center flex-gap">
              <div className="title-bar"></div>
              <div className="section-title">Featured</div>
            </div>
            <div className="flash-sales-title">New Arrival</div>
          </div>
        </div>
      </div>
      <div className="new-arrival-layout grid grid-gap-2">
        <div className="new-arrival-item item1 position-center position-relative">
          <img
            src={product1.image}
            alt={product1.name}
            style={{
              width: '80%',
              height: 'auto',
            }}
          />
          <div className="flex flex-column flex-gap new-arrival-product-info">
            <div className="product-name">{product1.name}</div>
            <div className="product-desc">{product1.desc}</div>
            <div className="buy-button-container">
              <button className="buy-button">Shop Now</button>
            </div>
          </div>
        </div>
        <div className="new-arrival-item item2 postition-right position-relative">
          <img
            src={product2.image}
            alt={product2.name}
            style={{
              width: 'auto',
              height: '80%',
            }}
          />
          <div className="flex flex-column flex-gap new-arrival-product-info">
            <div className="product-name">{product2.name}</div>
            <div className="product-desc">{product2.desc}</div>
            <div className="buy-button-container">
              <button className="buy-button">Shop Now</button>
            </div>
          </div>
        </div>
        <div className="new-arrival-item item3 position-center position-relative">
          <img
            src={product3.image}
            alt={product3.name}
            style={{
              width: 'auto',
              height: '70%',
            }}
          />
          <div className="flex flex-column flex-gap new-arrival-product-info">
            <div className="product-name">{product3.name}</div>
            <div className="product-desc">{product3.desc}</div>
            <div className="buy-button-container">
              <button className="buy-button">Shop Now</button>
            </div>
          </div>
        </div>
        <div className="new-arrival-item item4 position-center position-relative">
          <img
            src={product4.image}
            alt={product4.name}
            style={{
              width: 'auto',
              height: '70%',
            }}
          />
          <div className="flex flex-column flex-gap new-arrival-product-info">
            <div className="product-name">{product4.name}</div>
            <div className="product-desc">{product4.desc}</div>
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
