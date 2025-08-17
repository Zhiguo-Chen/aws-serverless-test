#!/usr/bin/env node

/**
 * 检查数据库表结构的临时脚本
 */

require('dotenv').config();
const { Pool } = require('pg');

async function checkTableStructure() {
  console.log('🔍 检查数据库表结构...');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 1,
  });

  try {
    const client = await pool.connect();

    // 检查 products 表结构
    console.log('📋 Products 表结构:');
    const productsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `);

    productsColumns.rows.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`,
      );
    });

    console.log('\n📋 Categories 表结构:');
    const categoriesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      ORDER BY ordinal_position
    `);

    categoriesColumns.rows.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`,
      );
    });

    client.release();
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
