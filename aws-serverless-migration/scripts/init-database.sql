-- Database initialization script for E-Commerce application
-- Run this script to create the required tables

-- Create Categories table
CREATE TABLE IF NOT EXISTS "Categories" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE IF NOT EXISTS "Products" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    "imageUrl" TEXT,
    "categoryId" INTEGER REFERENCES "Categories"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Users table
CREATE TABLE IF NOT EXISTS "Users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    phone VARCHAR(50),
    "isSeller" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Cart table
CREATE TABLE IF NOT EXISTS "Cart" (
    id SERIAL PRIMARY KEY,
    "userId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    "productId" INTEGER REFERENCES "Products"(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "productId")
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS "Orders" (
    id SERIAL PRIMARY KEY,
    "userId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create OrderItems table
CREATE TABLE IF NOT EXISTS "OrderItems" (
    id SERIAL PRIMARY KEY,
    "orderId" INTEGER REFERENCES "Orders"(id) ON DELETE CASCADE,
    "productId" INTEGER REFERENCES "Products"(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO "Categories" (name, description) VALUES 
    ('Electronics', 'Electronic devices and gadgets'),
    ('Clothing', 'Fashion and apparel'),
    ('Books', 'Books and literature'),
    ('Home & Garden', 'Home improvement and gardening'),
    ('Sports', 'Sports and fitness equipment')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO "Products" (name, description, price, "originalPrice", stock, "categoryId") VALUES 
    ('Smartphone', 'Latest smartphone with advanced features', 699.99, 799.99, 50, 1),
    ('Laptop', 'High-performance laptop for work and gaming', 1299.99, 1499.99, 25, 1),
    ('T-Shirt', 'Comfortable cotton t-shirt', 19.99, 24.99, 100, 2),
    ('Jeans', 'Classic blue jeans', 49.99, 59.99, 75, 2),
    ('Programming Book', 'Learn programming fundamentals', 39.99, 49.99, 30, 3),
    ('Garden Tools Set', 'Complete set of garden tools', 89.99, 109.99, 20, 4),
    ('Running Shoes', 'Professional running shoes', 129.99, 149.99, 40, 5)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON "Products"("categoryId");
CREATE INDEX IF NOT EXISTS idx_products_created ON "Products"("createdAt");
CREATE INDEX IF NOT EXISTS idx_cart_user ON "Cart"("userId");
CREATE INDEX IF NOT EXISTS idx_orders_user ON "Orders"("userId");
CREATE INDEX IF NOT EXISTS idx_orderitems_order ON "OrderItems"("orderId");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updatedAt columns
DROP TRIGGER IF EXISTS update_categories_updated_at ON "Categories";
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "Categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON "Products";
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "Products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON "Users";
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_updated_at ON "Cart";
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON "Cart" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON "Orders";
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "Orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orderitems_updated_at ON "OrderItems";
CREATE TRIGGER update_orderitems_updated_at BEFORE UPDATE ON "OrderItems" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();