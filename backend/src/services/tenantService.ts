import pool from '../db/pool.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CreateTenantInput {
  companyName: string;
  slug: string;
  plan: 'starter' | 'growth' | 'enterprise';
  adminEmail: string;
  adminPassword: string;
  adminFullName: string;
  region?: string;
}

export interface CreateTenantResult {
  tenantId: string;
  adminId: string;
  schemaName: string;
}

export async function createTenant(input: CreateTenantInput): Promise<CreateTenantResult> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const region = input.region || 'us-east-1';
    const schemaName = `tenant_${input.slug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

    const tenantResult = await client.query(
      `INSERT INTO tenants (company_name, slug, plan, status, region)
       VALUES ($1, $2, $3, 'active', $4)
       RETURNING id`,
      [input.companyName, input.slug, input.plan, region]
    );

    const tenantId = tenantResult.rows[0].id;
    console.log(`Created tenant ${tenantId} (${input.companyName})`);

    await client.query(
      `INSERT INTO subscriptions (tenant_id, plan, worker_limit, project_limit, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [
        tenantId,
        input.plan,
        input.plan === 'starter' ? 50 : input.plan === 'growth' ? 200 : 999999,
        input.plan === 'starter' ? 3 : 999999,
      ]
    );

    console.log(`Creating schema ${schemaName}...`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

    const migrationSql = await fs.readFile(
      path.join(__dirname, '..', 'db', 'migrations', '002_tenant_schema.sql'),
      'utf-8'
    );

    await client.query(`SET search_path TO ${schemaName}`);
    await client.query(migrationSql);
    console.log(`✓ Schema ${schemaName} created and migrated`);

    const pinHash = await bcrypt.hash(input.adminPassword, 10);

    await client.query(`SET search_path TO ${schemaName}`);
    const adminResult = await client.query(
      `INSERT INTO workers (name, phone, daily_rate, pin_hash, status)
       VALUES ($1, $2, 0, $3, 'ACTIVE')
       RETURNING id`,
      [input.adminFullName, input.adminEmail, pinHash]
    );

    const adminId = adminResult.rows[0].id;
    console.log(`Created admin user ${adminId}`);

    await client.query('COMMIT');

    return {
      tenantId,
      adminId,
      schemaName,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Tenant creation failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getTenantBySlug(slug: string) {
  const client = await pool.connect();
  try {
    await client.query('SET search_path TO public');
    const result = await client.query(
      `SELECT t.*, s.worker_limit, s.project_limit, s.status as subscription_status
       FROM tenants t
       LEFT JOIN subscriptions s ON t.id = s.tenant_id
       WHERE t.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getTenantById(id: string) {
  const client = await pool.connect();
  try {
    await client.query('SET search_path TO public');
    const result = await client.query(
      `SELECT t.*, s.worker_limit, s.project_limit, s.status as subscription_status
       FROM tenants t
       LEFT JOIN subscriptions s ON t.id = s.tenant_id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function checkTenantLimit(tenantId: string, type: 'worker' | 'project') {
  const client = await pool.connect();
  try {
    await client.query('SET search_path TO public');
    const subResult = await client.query(
      `SELECT worker_limit, project_limit, status FROM subscriptions WHERE tenant_id = $1`,
      [tenantId]
    );

    if (!subResult.rows[0]) {
      throw new Error('Subscription not found');
    }

    const { worker_limit, project_limit, status } = subResult.rows[0];

    if (status !== 'active') {
      throw new Error('Subscription is not active');
    }

    const schemaResult = await client.query(
      `SELECT slug FROM tenants WHERE id = $1`,
      [tenantId]
    );

    const schemaName = `tenant_${schemaResult.rows[0].slug}`;

    let currentCount: number;
    const limit = type === 'worker' ? worker_limit : project_limit;
    const table = type === 'worker' ? 'workers' : 'projects';

    await client.query(`SET search_path TO ${schemaName}`);
    const countRes = await client.query(`SELECT COUNT(*) FROM ${table}`);
    currentCount = parseInt(countRes.rows[0].count, 10);

    return {
      current: currentCount,
      limit,
      canCreate: currentCount < limit,
    };
  } finally {
    client.release();
  }
}
