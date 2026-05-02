import pool from '../db/pool.js';
import type { ScanType, SyncStatus } from '../types/index.js';

export interface SubmitScanInput {
  workerId: string;
  projectId: string;
  scanType: ScanType;
  lat?: number;
  lng?: number;
  facePhotoUrl?: string;
  faceMatchScoreLocal?: number;
}

const SCAN_ORDER: Record<ScanType, number> = {
  MORNING_IN: 1,
  MORNING_OUT: 2,
  AFTERNOON_IN: 3,
  AFTERNOON_OUT: 4,
  OT_IN: 5,
  OT_OUT: 6,
};

export async function submitScan(
  input: SubmitScanInput,
  tenantSlug: string
): Promise<{ accepted: boolean; scanId: string }> {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    const today = new Date().toISOString().split('T')[0];

    const existingResult = await client.query(
      `SELECT id, scan_type FROM attendance_scans
       WHERE worker_id = $1 AND DATE(scanned_at) = $2`,
      [input.workerId, today]
    );

    if (existingResult.rows.length > 0) {
      const existingScans = existingResult.rows.map((r) => r.scan_type);
      const currentOrder = SCAN_ORDER[input.scanType];

      for (const existing of existingScans) {
        if (existing === input.scanType) {
          throw new Error(`Scan ${input.scanType} already submitted for today`);
        }

        const existingOrder = SCAN_ORDER[existing as ScanType];
        if (existingOrder >= currentOrder) {
          throw new Error(`Cannot submit ${input.scanType} before completing ${existing}`);
        }
      }

      if (input.scanType !== 'MORNING_IN' && !existingScans.includes('MORNING_IN')) {
        throw new Error('Must submit MORNING_IN before other scans');
      }
    }

    const result = await client.query(
      `INSERT INTO attendance_scans
       (worker_id, project_id, scan_type, scanned_at, lat, lng, face_photo_url, face_match_score_local, sync_status)
       VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, 'PENDING')
       RETURNING id`,
      [
        input.workerId,
        input.projectId,
        input.scanType,
        input.lat,
        input.lng,
        input.facePhotoUrl,
        input.faceMatchScoreLocal,
      ]
    );

    return {
      accepted: true,
      scanId: result.rows[0].id,
    };
  } finally {
    client.release();
  }
}

export async function getTodayScans(workerId: string, tenantSlug: string) {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;
  const today = new Date().toISOString().split('T')[0];

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    const result = await client.query(
      `SELECT * FROM attendance_scans
       WHERE worker_id = $1 AND DATE(scanned_at) = $2
       ORDER BY scanned_at ASC`,
      [workerId, today]
    );

    return result.rows;
  } finally {
    client.release();
  }
}

export async function getFlaggedScans(tenantSlug: string) {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    const result = await client.query(
      `SELECT s.*, w.name as worker_name
       FROM attendance_scans s
       JOIN workers w ON s.worker_id = w.id
       WHERE s.face_verified = false AND s.sync_status = 'SYNCED'
       ORDER BY s.scanned_at DESC`
    );

    return result.rows;
  } finally {
    client.release();
  }
}

export async function verifyFaceScan(
  scanId: string,
  score: number,
  tenantSlug: string
): Promise<void> {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    const verified = score >= 0.80;

    await client.query(
      `UPDATE attendance_scans
       SET face_match_score_server = $1,
           face_verified = $2,
           sync_status = $3
       WHERE id = $4`,
      [score, verified, verified ? 'SYNCED' : 'REJECTED', scanId]
    );
  } finally {
    client.release();
  }
}
