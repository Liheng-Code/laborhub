import pool from '../db/pool.js';

export interface AuditInput {
  entityType: string;
  entityId: string;
  userId: string;
  action: string;
  ipAddress: string;
}

export async function logAudit(input: AuditInput, tenantSlug: string): Promise<void> {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    await client.query(
      `INSERT INTO audit_log (entity_type, entity_id, user_id, action, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [input.entityType, input.entityId, input.userId, input.action, input.ipAddress]
    );
  } finally {
    client.release();
  }
}

export async function getAuditLog(
  tenantSlug: string,
  options?: { limit?: number; offset?: number; entityType?: string }
) {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    let query = `
      SELECT a.*, w.name as actor_name
      FROM audit_log a
      LEFT JOIN workers w ON a.user_id = w.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (options?.entityType) {
      conditions.push(`a.entity_type = $${params.length + 1}`);
      params.push(options.entityType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await client.query(query, params);

    return result.rows;
  } finally {
    client.release();
  }
}
