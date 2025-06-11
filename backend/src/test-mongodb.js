// test-mongodb.js
import mongoose from 'mongoose';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { connectMongoDB } from './config/mongodb.js';

async function testMongoDBConnection() {
  try {
    console.log('Testing MongoDB connection...');

    // 1. 测试基本连接
    await connectMongoDB();
    console.log('✓ MongoDB connected successfully');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.db?.databaseName);

    // 2. 测试数据库对象
    if (!mongoose.connection.db) {
      throw new Error('Database object not available');
    }
    console.log('✓ Database object available');

    // 3. 测试集合访问
    const collection = mongoose.connection.db.collection('chat_histories');
    console.log('✓ Collection reference created');

    // 4. 测试基本 CRUD 操作
    const testDoc = {
      sessionId: 'test-session-' + Date.now(),
      messages: [{ type: 'human', content: 'test message' }],
      createdAt: new Date(),
    };

    const insertResult = await collection.insertOne(testDoc);
    console.log('✓ Test document inserted:', insertResult.insertedId);

    const findResult = await collection.findOne({
      sessionId: testDoc.sessionId,
    });
    console.log('✓ Test document found:', findResult ? 'Yes' : 'No');

    // 5. 测试 MongoDBChatMessageHistory
    console.log('Testing MongoDBChatMessageHistory...');
    const chatHistory = new MongoDBChatMessageHistory({
      database: mongoose.connection.db,
      collectionName: 'chat_histories_test',
      sessionId: 'test-session-langchain-' + Date.now(),
    });

    console.log('✓ MongoDBChatMessageHistory instance created');

    // 测试获取消息（这里可能会失败）
    try {
      const messages = await chatHistory.getMessages();
      console.log('✓ getMessages() successful, count:', messages.length);
    } catch (error) {
      console.error('✗ getMessages() failed:', error.message);
      console.error('Error details:', error);

      // 检查具体错误类型
      if (error.message.includes('findOne')) {
        console.error("This is the findOne error we're trying to fix!");

        // 尝试直接访问集合
        try {
          const directAccess = await mongoose.connection.db
            .collection('chat_histories_test')
            .findOne({ sessionId: chatHistory.sessionId });
          console.log('Direct collection access result:', directAccess);
        } catch (directError) {
          console.error('Direct collection access also failed:', directError);
        }
      }
    }

    // 清理测试数据
    await collection.deleteOne({ sessionId: testDoc.sessionId });
    console.log('✓ Test cleanup completed');
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error stack:', error.stack);
  } finally {
    // 关闭连接
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

// 运行测试
testMongoDBConnection();
