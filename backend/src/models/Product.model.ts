// models/Product.js
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Category } from './Category.model';
import { ProductImage } from './ProductImage.model';
import { Review } from './Review.model';

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
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  originalPrice!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  discountPercentage!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  stockQuantity!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isFeatured!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isNewArrival!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isFlashSale!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  flashSaleEndsAt?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl?: string;

  @HasMany(() => ProductImage, { foreignKey: 'productId' })
  productImages?: ProductImage[];

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId!: number;

  @BelongsTo(() => Category)
  category!: Category;

  @HasMany(() => Review, {
    foreignKey: 'productId',
    onDelete: 'CASCADE',
  })
  reviews?: Review[];
}
