import mongoose from 'mongoose';

// MongoDB Schema for Chat History
const ChatHistorySchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  messages: [
    {
      type: { type: String, enum: ['human', 'ai'], required: true },
      content: {
        type: mongoose.Schema.Types.Mixed, // 支持文本和图片内容
        required: true,
      },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 确保同一个 sessionId 只有一个文档
ChatHistorySchema.index({ sessionId: 1 }, { unique: true });

export const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);
