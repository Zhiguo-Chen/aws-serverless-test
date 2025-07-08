// models/Category.ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Product } from './Product.model';

@Table({
  tableName: 'categories',
  timestamps: true,
})
export class Category extends Model {
  // Changed to default export
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  // Fix duplicate @Column decorator
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  slug!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  @HasMany(() => Product, {
    foreignKey: 'categoryId',
    onDelete: 'CASCADE',
  })
  products!: Product[];
}
