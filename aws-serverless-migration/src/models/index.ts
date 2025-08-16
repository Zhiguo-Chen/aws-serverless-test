// 导出数据库连接和模型
export {
  getSequelizeInstance,
  connectToDatabase,
  closeConnection,
} from '../utils/database';

// 导出模型
export { User } from './User.model';
export { Product } from './Product.model';
export { Category } from './Category.model';

// 类型定义
export interface UserInterface {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  isSeller?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInterface {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemInterface {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderInterface {
  id: string;
  userId: string;
  items: OrderItemInterface[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemInterface {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}
