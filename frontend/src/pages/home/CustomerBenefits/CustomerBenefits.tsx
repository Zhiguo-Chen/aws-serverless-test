import { ReactComponent as DeliveryIcon } from '../../../assets/icons/icon-delivery.svg';
import { ReactComponent as CustomerIcon } from '../../../assets/icons/Icon-Customer service.svg';
import { ReactComponent as SecureIcon } from '../../../assets/icons/Icon-secure.svg';

const CustomerBenefits = () => {
  return (
    <div className="customer-benefits flex">
      <div className="customer-benefits-item flex-1 flex justify-center align-center flex-column">
        <div className="customer-benefits-icon-container flex align-center justify-center">
          <DeliveryIcon />
        </div>
        <div className="customer-benefits-title">FREE AND FAST DELIVERY</div>
        <div className="customer-benefits-desc">
          Free delivery for all orders over $140
        </div>
      </div>
      <div className="customer-benefits-item flex-1 flex justify-center align-center flex-column">
        <div className="customer-benefits-icon-container flex align-center justify-center">
          <CustomerIcon />
        </div>
        <div className="customer-benefits-title">24/7 CUSTOMER SERVICE</div>
        <div className="customer-benefits-desc">
          Friendly 24/7 customer support
        </div>
      </div>
      <div className="customer-benefits-item flex-1 flex justify-center align-center flex-column">
        <div className="customer-benefits-icon-container flex align-center justify-center">
          <SecureIcon />
        </div>
        <div className="customer-benefits-title">MONEY BACK GUARANTEE</div>
        <div className="customer-benefits-desc">
          We reurn money within 30 days
        </div>
      </div>
    </div>
  );
};

export default CustomerBenefits;
