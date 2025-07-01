import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from './User.model';
import { Product } from './Product.model';
import { OrderXProduct } from './OrderXProduct.model';

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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsToMany(() => Product, () => OrderXProduct)
  products!: Product[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  paymentMethod!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  totalAmount!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  status?: string;
}
