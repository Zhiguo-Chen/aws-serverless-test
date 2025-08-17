import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

// 获取数据库连接池
export const getPool = (): Pool => {
  if (!pool) {
    console.log('Creating PostgreSQL connection pool...');

    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 5,
      min: 0,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    console.log('✅ PostgreSQL pool created');
  }

  return pool;
};

// 执行查询
export const query = async (text: string, params?: any[]): Promise<any> => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// 获取客户端连接
export const getClient = async (): Promise<PoolClient> => {
  const pool = getPool();
  return await pool.connect();
};

// 关闭连接池
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL pool closed');
  }
};
