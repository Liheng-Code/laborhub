import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../db/pool.js';
import type { UserRole, DecodedToken } from '../types/index.js';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
    tenantId: string;
    tenantSlug: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const jwtSignOptions = (expiresIn: string): SignOptions => ({ expiresIn: expiresIn as any });

export async function login(input: LoginInput, tenantSlug: string): Promise<AuthResult> {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    const result = await client.query(
      `SELECT w.id, w.name, w.pin_hash, w.status
       FROM workers w
       WHERE w.phone = $1`,
      [input.email]
    );

    if (!result.rows[0]) {
      throw new Error('Invalid credentials');
    }

    const worker = result.rows[0];

    if (worker.status !== 'ACTIVE') {
      throw new Error('Account is inactive');
    }

    const validPassword = await bcrypt.compare(input.password, worker.pin_hash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const tenantResult = await pool.query(
      `SELECT id, plan FROM tenants WHERE slug = $1`,
      [tenantSlug]
    );

    if (!tenantResult.rows[0]) {
      throw new Error('Tenant not found');
    }

    const tenant = tenantResult.rows[0];

    const role: UserRole = 'worker';

    const payload: DecodedToken = {
      userId: worker.id,
      tenantId: tenant.id,
      role,
      email: input.email,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, jwtSignOptions(JWT_EXPIRES_IN));
    const refreshToken = jwt.sign(payload, JWT_SECRET, jwtSignOptions(JWT_REFRESH_EXPIRES_IN));

    return {
      accessToken,
      refreshToken,
      user: {
        id: worker.id,
        email: input.email,
        role,
        fullName: worker.name,
        tenantId: tenant.id,
        tenantSlug,
      },
    };
  } finally {
    client.release();
  }
}

export async function adminLogin(email: string, password: string, tenantSlug: string): Promise<AuthResult> {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    const result = await client.query(
      `SELECT id, name, pin_hash, status
       FROM workers
       WHERE phone = $1`,
      [email]
    );

    if (!result.rows[0]) {
      throw new Error('Invalid credentials');
    }

    const admin = result.rows[0];

    const validPassword = await bcrypt.compare(password, admin.pin_hash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const tenantResult = await pool.query(
      `SELECT id, plan FROM tenants WHERE slug = $1`,
      [tenantSlug]
    );

    if (!tenantResult.rows[0]) {
      throw new Error('Tenant not found');
    }

    const tenant = tenantResult.rows[0];

    const role: UserRole = 'admin';

    const payload: DecodedToken = {
      userId: admin.id,
      tenantId: tenant.id,
      role,
      email,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, jwtSignOptions(JWT_EXPIRES_IN));
    const refreshToken = jwt.sign(payload, JWT_SECRET, jwtSignOptions(JWT_REFRESH_EXPIRES_IN));

    return {
      accessToken,
      refreshToken,
      user: {
        id: admin.id,
        email,
        role,
        fullName: admin.name,
        tenantId: tenant.id,
        tenantSlug,
      },
    };
  } finally {
    client.release();
  }
}

export function verifyToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    throw new Error('Invalid token');
  }
}

export async function refreshToken(oldRefreshToken: string) {
  const decoded = verifyToken(oldRefreshToken);

  const payload: DecodedToken = {
    userId: decoded.userId,
    tenantId: decoded.tenantId,
    role: decoded.role,
    email: decoded.email,
  };

  const newAccessToken = jwt.sign(payload, JWT_SECRET, jwtSignOptions(JWT_EXPIRES_IN));
  const newRefreshToken = jwt.sign(payload, JWT_SECRET, jwtSignOptions(JWT_REFRESH_EXPIRES_IN));

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
