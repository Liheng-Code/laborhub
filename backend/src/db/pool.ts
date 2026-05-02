import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

export default pool;

export async function setTenantSchema(schemaName: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${schemaName}, public`);
  } finally {
    client.release();
  }
}
