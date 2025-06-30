import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Cart } from './Cart.model';
import { Product } from './Product.model';
import { User } from './User.model';

@Table({
  tableName: 'cart_items',
  timestamps: true,
})
export class CartItem extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Cart)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  cartId!: string;

  @BelongsTo(() => Cart)
  cart!: Cart;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity!: number;
}
