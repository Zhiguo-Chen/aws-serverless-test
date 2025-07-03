import mongoose, { Document, Schema } from 'mongoose';

// Interface for the embedded product snapshot
export interface IOrderProduct {
  productId: string; // Soft link to the original product
  name: string;
  description?: string;
  price: number;
  originalPrice: number;
  imageUrl?: string;
  quantity: number;
}

const OrderProductSchema: Schema = new Schema({
  productId: { type: String, required: true }, // Keep a reference, but data below is the snapshot
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true }, // Price at the time of order
  originalPrice: { type: Number, required: true },
  imageUrl: { type: String },
  quantity: { type: Number, required: true, min: 1 },
});

// Interface for the Order document
export interface IOrder extends Document {
  userId: string;
  products: IOrderProduct[];
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    // No need for a custom ID, MongoDB's ObjectId is perfect
    userId: { type: String, required: true, index: true },
    products: [OrderProductSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentMethod: { type: String, required: true },
    shippingAddress: {
      type: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      },
      required: false, // Or true, depending on your business logic
    },
  },
  {
    timestamps: true, // Handles createdAt and updatedAt automatically
  },
);

export const MongoOrder = mongoose.model<IOrder>('Order', OrderSchema);
