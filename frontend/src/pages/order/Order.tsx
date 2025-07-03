import React, { useEffect, useState } from 'react';
import './Order.scss';
import { deleteOrder, getOrderList } from '../../api/order';
import { API_URL } from '../../const/API_URL';

interface OrderProduct {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

interface OrderItem {
  _id: string;
  createdAt: string;
  products: OrderProduct[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
}

const Order: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    // Fetch order list
    getOrderList().then((data) => {
      setOrders(data.orders || []);
    });
  }, []);

  const handleDeleteOrder = (orderId: string) => {
    return async () => {
      const data = await deleteOrder(orderId);
      if (data.success) {
        // Remove the deleted order from the state
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId),
        );
      } else {
        console.error('Failed to delete order:', data.message);
      }
    };
  };

  return (
    <div className="order-page flex-1">
      {orders.map((order) => (
        <div className="order-block" key={order._id}>
          <div className="order-header">
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className="order-id">Order No: {order._id}</span>
            <span className="order-status">{order.status}</span>
            <span className="order-detail-btn">Order Details &gt;</span>
          </div>
          <div className="order-products">
            {order.products.map((product) => (
              <div className="order-product-item" key={product.productId}>
                <img
                  src={`${API_URL}/public${product.imageUrl}`}
                  alt={product.name}
                  className="order-product-img"
                />
                <div className="order-product-info">
                  <div className="order-product-title">{product.name}</div>
                  <div className="order-product-qty">x{product.quantity}</div>
                </div>
                <div className="order-product-price">${product.price}</div>
              </div>
            ))}
          </div>
          <div className="order-footer">
            <div className="order-total">Total: ${order.totalAmount}</div>
            <div className="order-actions">
              <button className="order-btn">Buy Again</button>
              <button className="order-btn">After-Sales</button>
              <button
                className="order-btn"
                onClick={handleDeleteOrder(order._id)}
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Order;
