import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Category } from './Category.model';
import { ProductImage } from './ProductImage.model';
import { Review } from './Review.model';
import { CartItem } from './CartItem.model';
import { OrderItem } from './OrderItem.model';

@Table({
  tableName: 'products',
  timestamps: true,
})
export class Product extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare originalPrice: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare discountPercentage: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare stockQuantity: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isFeatured: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isNewArrival: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isHotSale: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isFlashSale: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare flashSaleEndsAt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare imageUrl: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare categoryId: number;

  @BelongsTo(() => Category)
  category?: Category;

  @HasMany(() => ProductImage)
  productImages?: ProductImage[];

  @HasMany(() => Review)
  reviews?: Review[];

  @HasMany(() => CartItem)
  cartItems?: CartItem[];

  @HasMany(() => OrderItem)
  orderItems?: OrderItem[];

  // Virtual field for stock status
  get inStock(): boolean {
    return this.stockQuantity > 0;
  }
}
