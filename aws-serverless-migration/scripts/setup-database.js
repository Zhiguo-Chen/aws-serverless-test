#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  // Create connection pool
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();

    // Read and execute SQL file
    console.log('📄 Reading SQL initialization file...');
    const sqlFile = path.join(__dirname, 'init-database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🔧 Executing database initialization...');
    await pool.query(sql);

    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - Categories');
    console.log('   - Products');
    console.log('   - Users');
    console.log('   - Cart');
    console.log('   - Orders');
    console.log('   - OrderItems');
    console.log('🌱 Sample data inserted');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();
