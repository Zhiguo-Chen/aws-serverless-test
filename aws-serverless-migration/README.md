# E-Commerce Serverless Backend

A modern serverless e-commerce backend built with AWS Lambda, Sequelize ORM, and TypeScript.

## 🚀 Features

- **Serverless Architecture**: Built on AWS Lambda for scalability and cost-efficiency
- **ORM Integration**: Uses Sequelize ORM for type-safe database operations
- **TypeScript**: Full TypeScript support for better development experience
- **Multi-Database**: Supports both PostgreSQL and MongoDB
- **Authentication**: JWT-based authentication system
- **File Upload**: Azure Blob Storage integration for product images
- **AI Chat**: Integrated AI chat functionality with multiple providers
- **CORS Support**: Proper CORS configuration for frontend integration

## 📦 Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework
- **Language**: TypeScript
- **ORM**: Sequelize with PostgreSQL
- **NoSQL**: MongoDB for chat history
- **Storage**: Azure Blob Storage
- **AI**: OpenAI, Gemini, Grok integration
- **Authentication**: JWT
- **Deployment**: AWS Lambda + API Gateway

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd aws-serverless-migration

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:setup
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# JWT
JWT_SECRET=your-jwt-secret

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=your-password
DB_SSL=false

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# AI Services
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=your-account
AZURE_STORAGE_ACCOUNT_KEY=your-key
AZURE_STORAGE_CONTAINER_NAME=product-images
```

## 🚀 Development

```bash
# Start local development server
npm run dev

# Build TypeScript
npm run build

# Run linting
npm run lint

# Clean build artifacts
npm run clean
```

## 📡 API Endpoints

### Authentication

- `POST /api/login` - User login
- `POST /api/register` - User registration

### Products

- `GET /api/products` - List all products
- `GET /api/products/list-all` - Detailed product list with statistics
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Categories

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Cart & Orders

- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `POST /api/order` - Create order

### Chat

- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history/{sessionId}` - Get chat history
- `DELETE /api/chat/history/{sessionId}` - Clear chat history

### File Upload

- `POST /api/upload` - Upload file
- `POST /api/upload/signed-url` - Get signed upload URL
- `DELETE /api/upload/{key}` - Delete file

## 🚀 Deployment

### Deploy to AWS

```bash
# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy:prod

# Remove deployment
npm run remove
```

### Prerequisites for Deployment

1. **AWS CLI configured** with appropriate permissions
2. **Serverless Framework** installed globally
3. **Database** accessible from AWS (RDS for PostgreSQL)
4. **Environment variables** configured for production

## 📊 Database Schema

The application uses the following main entities:

- **Users**: User accounts and authentication
- **Categories**: Product categories
- **Products**: Product catalog with pricing and inventory
- **Cart**: Shopping cart items
- **Orders**: Order management
- **OrderItems**: Order line items

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention via ORM
- CORS configuration
- Input validation
- Secure file upload handling

## 📈 Monitoring & Logging

- CloudWatch integration for logs
- Error tracking and monitoring
- Performance metrics
- Request/response logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please refer to the documentation in the `/docs` folder or create an issue in the repository.
