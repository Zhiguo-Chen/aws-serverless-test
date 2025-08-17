import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import { Review } from './Review.model';
import { CartItem } from './CartItem.model';
import { Order } from './Order.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isSeller: boolean;

  @HasMany(() => Review)
  reviews?: Review[];

  @HasMany(() => CartItem)
  cartItems?: CartItem[];

  @HasMany(() => Order)
  orders?: Order[];

  // Virtual field for full name
  get name(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
