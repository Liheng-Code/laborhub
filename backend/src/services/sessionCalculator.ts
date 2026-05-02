import pool from '../db/pool.js';

export async function calculateSessions(tenantSlug: string): Promise<number> {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    const today = new Date().toISOString().split('T')[0];

    const workersResult = await client.query(
      `SELECT DISTINCT worker_id FROM attendance_scans
       WHERE DATE(scanned_at) = $1`,
      [today]
    );

    let sessionsCreated = 0;

    for (const { worker_id } of workersResult.rows) {
      const scansResult = await client.query(
        `SELECT scan_type, scanned_at FROM attendance_scans
         WHERE worker_id = $1 AND DATE(scanned_at) = $2
         ORDER BY scanned_at ASC`,
        [worker_id, today]
      );

      const scans = scansResult.rows;
      const scanMap: Record<string, Date> = {};

      for (const scan of scans) {
        scanMap[scan.scan_type] = new Date(scan.scanned_at);
      }

      let morningHours: number | null = null;
      let afternoonHours: number | null = null;
      let otHours: number | null = null;

      if (scanMap['MORNING_IN'] && scanMap['MORNING_OUT']) {
        const diff = (scanMap['MORNING_OUT'].getTime() - scanMap['MORNING_IN'].getTime()) / (1000 * 60 * 60);
        morningHours = Math.round(diff * 100) / 100;
      }

      if (scanMap['AFTERNOON_IN'] && scanMap['AFTERNOON_OUT']) {
        const diff = (scanMap['AFTERNOON_OUT'].getTime() - scanMap['AFTERNOON_IN'].getTime()) / (1000 * 60 * 60);
        afternoonHours = Math.round(diff * 100) / 100;
      }

      if (scanMap['OT_IN'] && scanMap['OT_OUT']) {
        const diff = (scanMap['OT_OUT'].getTime() - scanMap['OT_IN'].getTime()) / (1000 * 60 * 60);
        otHours = Math.min(Math.round(diff * 100) / 100, 4.0);
      }

      const totalRegularHours = (morningHours || 0) + (afternoonHours || 0);
      const totalOtHours = otHours || 0;

      const projectId = scansResult.rows[0]?.project_id;

      await client.query(
        `INSERT INTO work_sessions
         (worker_id, project_id, date, morning_hours, afternoon_hours, ot_hours, total_regular_hours, total_ot_hours, computed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (worker_id, date)
         DO UPDATE SET
           morning_hours = EXCLUDED.morning_hours,
           afternoon_hours = EXCLUDED.afternoon_hours,
           ot_hours = EXCLUDED.ot_hours,
           total_regular_hours = EXCLUDED.total_regular_hours,
           total_ot_hours = EXCLUDED.total_ot_hours,
           computed_at = NOW()`,
        [
          worker_id,
          projectId,
          today,
          morningHours,
          afternoonHours,
          otHours,
          totalRegularHours || null,
          totalOtHours || null,
        ]
      );

      sessionsCreated++;
    }

    return sessionsCreated;
  } finally {
    client.release();
  }
}

export async function detectIncompletePairs(tenantSlug: string): Promise<Array<{ workerId: string; missingScan: string }>> {
  const schemaName = `tenant_${tenantSlug.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`;

  const client = await pool.connect();
  const flags: Array<{ workerId: string; missingScan: string }> = [];

  try {
    await client.query(`SET search_path TO ${schemaName}`);

    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 13) {
      const morningIncomplete = await client.query(
        `SELECT worker_id FROM attendance_scans
         WHERE scan_type = 'MORNING_IN' AND DATE(scanned_at) = CURRENT_DATE
         AND worker_id NOT IN (
           SELECT worker_id FROM attendance_scans
           WHERE scan_type = 'MORNING_OUT' AND DATE(scanned_at) = CURRENT_DATE
         )`
      );

      for (const row of morningIncomplete.rows) {
        flags.push({ workerId: row.worker_id, missingScan: 'MORNING_OUT' });
      }
    }

    if (currentHour >= 18) {
      const afternoonIncomplete = await client.query(
        `SELECT worker_id FROM attendance_scans
         WHERE scan_type = 'AFTERNOON_IN' AND DATE(scanned_at) = CURRENT_DATE
         AND worker_id NOT IN (
           SELECT worker_id FROM attendance_scans
           WHERE scan_type = 'AFTERNOON_OUT' AND DATE(scanned_at) = CURRENT_DATE
         )`
      );

      for (const row of afternoonIncomplete.rows) {
        flags.push({ workerId: row.worker_id, missingScan: 'AFTERNOON_OUT' });
      }
    }

    if (currentHour >= 23) {
      const otIncomplete = await client.query(
        `SELECT worker_id FROM attendance_scans
         WHERE scan_type = 'OT_IN' AND DATE(scanned_at) = CURRENT_DATE
         AND worker_id NOT IN (
           SELECT worker_id FROM attendance_scans
           WHERE scan_type = 'OT_OUT' AND DATE(scanned_at) = CURRENT_DATE
         )`
      );

      for (const row of otIncomplete.rows) {
        flags.push({ workerId: row.worker_id, missingScan: 'OT_OUT' });
      }
    }

    return flags;
  } finally {
    client.release();
  }
}
