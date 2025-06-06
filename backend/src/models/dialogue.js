import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const dialogueSchema = new mongoose.Schema({
  dialogueId: {
    default: uuidv4,
    type: String,
    required: true,
    unique: true,
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'Session',
  },
  responseId: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true,
  },
  message: {
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

dialogueSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Dialogue = mongoose.model('Dialogue', dialogueSchema);

export default Dialogue;
