import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Product } from './Product.model';

@Table({
  tableName: 'categories',
  timestamps: true,
})
export class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @HasMany(() => Product)
  products?: Product[];
}
