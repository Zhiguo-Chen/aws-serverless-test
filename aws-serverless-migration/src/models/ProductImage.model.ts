import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Product } from './Product.model';

@Table({
  tableName: 'product_images',
  timestamps: true,
})
export class ProductImage extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isPrimary: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare altText: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare imageUrl: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare productId: string;

  @BelongsTo(() => Product)
  product?: Product;
}
