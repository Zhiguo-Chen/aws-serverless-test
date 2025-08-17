import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './User.model';
import { OrderItem } from './OrderItem.model';

@Table({
  tableName: 'orders',
  timestamps: true,
})
export class Order extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare total: number;

  @Column({
    type: DataType.ENUM(
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ),
    defaultValue: 'pending',
  })
  declare status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare shippingAddress: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare paymentMethod: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  user?: User;

  @HasMany(() => OrderItem)
  items?: OrderItem[];
}
