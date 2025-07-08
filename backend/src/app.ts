import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { testConnection, syncDatabase, closeConnection } from './models';
import { connectMongoDB } from './config/mongodb';

// Import routes
import routes from './routes/routes';

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const app = express();

app.use('/public', express.static(publicDir));

// Middleware
const corsOptions = {
  // Add all your frontend application URLs here
  origin: [
    'https://my-demo.camdvr.org',
    'https://icy-sky-08145be00.6.azurestaticapps.net',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ],
  // Explicitly allow all standard HTTP methods
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // Allow frontend to carry fields like 'Content-Type' and 'Authorization' in request headers
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Respond to preflight requests with a 200 status code to ensure compatibility
  optionsSuccessStatus: 200,
};

// 2. Apply the configuration with detailed options to the CORS middleware
app.use(cors(corsOptions));

// 3. Continue to use other middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', routes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  },
);

const start = async () => {
  try {
    console.log('Starting application initialization...');

    // 1. Test database connection (models are loaded automatically)
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // 2. Connect to MongoDB
    await connectMongoDB();
    console.log('MongoDB connected successfully');

    // 3. Sync database
    await syncDatabase({
      force:
        process.env.NODEENV === 'development' &&
        process.env.DB_FORCE_SYNC === 'true',
      alter:
        process.env.NODEENV === 'development' &&
        process.env.DB_ALTER_SYNC === 'true',
    });
    console.log('Database synced successfully');

    // 4. Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Application startup completed successfully');
    });

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      await closeConnection();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      await closeConnection();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    await closeConnection();
    process.exit(1);
  }
};

start();
