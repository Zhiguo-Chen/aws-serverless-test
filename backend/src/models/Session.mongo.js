import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const sessionSchema = new Schema({
  sessionId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the updatedAt field on save
sessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Session = model('Session', sessionSchema);

export default Session;
