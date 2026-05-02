import { Pool } from 'pg';

export interface WbsNode {
  id: string;
  project_id: string;
  parent_id: string | null;
  level: number;
  zone: string | null;
  label: string;
  planned_quantity?: number;
  planned_unit?: string;
  planned_start?: string;
  planned_end?: string;
  created_at: string;
}

export interface WbsOverlay {
  node_id: string;
  label: string;
  zone: string;
  total_output?: number;
  total_manpower?: number;
  productivity_ratio?: number;
  flag?: string;
}

export interface WbsNodeDetail extends WbsNode {
  overlays: WbsOverlay[];
  children: WbsNode[];
}

export async function getWbsNodes(projectId: string, tenantSlug: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO tenant_${tenantSlug}, public`);
    const result = await client.query(
      `SELECT * FROM wbs_nodes WHERE project_id = $1 ORDER BY level, label`,
      [projectId]
    );
    return result.rows;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function getWbsOverlays(projectId: string, tenantSlug: string, date?: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO tenant_${tenantSlug}, public`);
    
    let query = `
      SELECT 
        wn.id as node_id,
        wn.label,
        wn.zone,
        COALESCE(SUM(ps.output), 0) as total_output,
        COALESCE(SUM(ps.manpower_count), 0) as total_manpower,
        COALESCE(AVG(ps.productivity_ratio), 0) as productivity_ratio,
        MAX(ps.flag) as flag
      FROM wbs_nodes wn
      LEFT JOIN productivity_snapshots ps ON wn.id = ps.wbs_node_id
      WHERE wn.project_id = $1
    `;
    
    const params: any[] = [projectId];
    
    if (date) {
      query += ` AND ps.date = $2`;
      params.push(date);
    }
    
    query += ` GROUP BY wn.id, wn.label, wn.zone ORDER BY wn.level, wn.label`;
    
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function getWbsNodeDetail(id: string, tenantSlug: string, date?: string): Promise<WbsNodeDetail | null> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO tenant_${tenantSlug}, public`);
    
    // Get node details
    const nodeResult = await client.query(
      `SELECT * FROM wbs_nodes WHERE id = $1`,
      [id]
    );
    
    if (nodeResult.rowCount === 0) return null;
    
    const node = nodeResult.rows[0];
    
    // Get overlays
    const overlays = await getWbsOverlays(node.project_id, tenantSlug, date);
    const nodeOverlay = overlays.find(o => o.node_id === id);
    
    // Get children
    const childrenResult = await client.query(
      `SELECT * FROM wbs_nodes WHERE parent_id = $1 ORDER BY label`,
      [id]
    );
    
    return {
      ...node,
      overlays: nodeOverlay ? [nodeOverlay] : [],
      children: childrenResult.rows,
    };
  } finally {
    client.release();
    await pool.end();
  }
}

export async function createWbsNode(
  projectId: string,
  parentId: string | null,
  level: number,
  zone: string | undefined,
  label: string,
  plannedQuantity: number | undefined,
  plannedUnit: string | undefined,
  plannedStart: string | undefined,
  plannedEnd: string | undefined,
  tenantSlug: string
): Promise<any> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET search_path TO tenant_${tenantSlug}, public`);
    
    const result = await client.query(
      `INSERT INTO wbs_nodes (project_id, parent_id, level, zone, label, planned_quantity, planned_unit, planned_start, planned_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [projectId, parentId, level, zone, label, plannedQuantity, plannedUnit, plannedStart, plannedEnd]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function updateWbsNode(id: string, data: Partial<WbsNode>, tenantSlug: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET search_path TO tenant_${tenantSlug}, public`);
    
    const fields = [];
    const values: any[] = [];
    let idx = 1;
    
    if (data.label !== undefined) { fields.push(`label = $${idx}`); values.push(data.label); idx++; }
    if (data.zone !== undefined) { fields.push(`zone = $${idx}`); values.push(data.zone); idx++; }
    if (data.planned_quantity !== undefined) { fields.push(`planned_quantity = $${idx}`); values.push(data.planned_quantity); idx++; }
    if (data.planned_unit !== undefined) { fields.push(`planned_unit = $${idx}`); values.push(data.planned_unit); idx++; }
    if (data.planned_start !== undefined) { fields.push(`planned_start = $${idx}`); values.push(data.planned_start); idx++; }
    if (data.planned_end !== undefined) { fields.push(`planned_end = $${idx}`); values.push(data.planned_end); idx++; }
    
    fields.push(`updated_at = NOW()`);
    
    values.push(id);
    
    const result = await client.query(
      `UPDATE wbs_nodes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function moveWbsNode(id: string, newParentId: string | null, newSortOrder: number, tenantSlug: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET search_path TO tenant_${tenantSlug}, public`);
    
    // Get current node
    const nodeResult = await client.query(
      `SELECT * FROM wbs_nodes WHERE id = $1`,
      [id]
    );
    
    if (nodeResult.rowCount === 0) throw new Error('WBS node not found');
    
    const node = nodeResult.rows[0];
    
    // Check for cycles if moving to a child
    if (newParentId) {
      const cycleCheck = await client.query(
        `WITH RECURSIVE children AS (
           SELECT id, parent_id FROM wbs_nodes WHERE id = $1
           UNION
           SELECT wn.id, wn.parent_id FROM wbs_nodes wn INNER JOIN children c ON wn.parent_id = c.id
         )
         SELECT id FROM children WHERE id = $2`,
        [newParentId, id]
      );
      
      if (cycleCheck && cycleCheck.rowCount !== null && cycleCheck.rowCount > 0) {
        throw { code: 'CYCLE_DETECTED', message: 'Cannot move node to its own descendant' };
      }
    }
    
    // Update parent and level
    const newLevel = newParentId ? node.level + 1 : 0;
    
    await client.query(
      `UPDATE wbs_nodes SET parent_id = $1, level = $2, updated_at = NOW() WHERE id = $3`,
      [newParentId, newLevel, id]
    );
    
    await client.query('COMMIT');
    
    const updatedNode = await client.query(
      `SELECT * FROM wbs_nodes WHERE id = $1`,
      [id]
    );
    
    return updatedNode.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function deleteWbsNode(id: string, tenantSlug: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET search_path TO tenant_${tenantSlug}, public`);
    
    // Check if node has children
    const childrenCheck = await client.query(
      `SELECT id FROM wbs_nodes WHERE parent_id = $1`,
      [id]
    );
    
    if (childrenCheck && childrenCheck.rowCount !== null && childrenCheck.rowCount > 0) {
      throw { code: 'NOT_EMPTY', message: 'Cannot delete node with children. Move or delete children first.' };
    }
    
    // Check if node has progress logs
    const progressCheck = await client.query(
      `SELECT id FROM progress_logs WHERE wbs_node_id = $1`,
      [id]
    );
    
    if (progressCheck && progressCheck.rowCount !== null && progressCheck.rowCount > 0) {
      throw { code: 'NOT_EMPTY', message: 'Cannot delete node with progress logs.' };
    }
    
    await client.query(
      `DELETE FROM wbs_nodes WHERE id = $1`,
      [id]
    );
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
