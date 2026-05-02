import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  console.log('Running database migrations...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const migrationFiles = [
      '001_public_schema.sql',
      '002_tenant_schema.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, 'migrations', file);
      const sql = await fs.readFile(filePath, 'utf-8');

      console.log(`Applying ${file}...`);
      await client.query(sql);
      console.log(`✓ ${file} applied successfully`);
    }

    await client.query('COMMIT');
    console.log('\n✓ All migrations applied successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
