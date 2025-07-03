import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Order } from './Order.model';
import { Product } from './Product.model';

@Table({
  tableName: 'order_products',
  timestamps: false,
})
export class OrderProduct extends Model {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  orderId!: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  productId!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  price!: number;
}
