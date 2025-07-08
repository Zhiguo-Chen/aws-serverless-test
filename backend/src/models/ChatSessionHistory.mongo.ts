import mongoose from 'mongoose';

// MongoDB Schema for Chat History
const ChatHistorySchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  messages: [
    {
      type: { type: String, enum: ['human', 'ai'], required: true },
      content: {
        type: mongoose.Schema.Types.Mixed, // Support text and image content
        required: true,
      },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure that there is only one document for the same sessionId
ChatHistorySchema.index({ sessionId: 1 }, { unique: true });

export const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);
