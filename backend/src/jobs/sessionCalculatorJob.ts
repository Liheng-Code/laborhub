import { calculateSessions, detectIncompletePairs } from '../services/sessionCalculator.js';

let sessionInterval: NodeJS.Timeout | null = null;
let detectionInterval: NodeJS.Timeout | null = null;

export function startSessionCalculator(tenantSlug: string) {
  console.log('Starting session calculator cron (every 30 minutes)...');

  sessionInterval = setInterval(async () => {
    try {
      const sessionsCreated = await calculateSessions(tenantSlug);
      console.log(`[Session Calculator] Created/updated ${sessionsCreated} sessions`);
    } catch (error) {
      console.error('[Session Calculator] Error:', error);
    }
  }, 30 * 60 * 1000);

  detectionInterval = setInterval(async () => {
    try {
      const flags = await detectIncompletePairs(tenantSlug);
      if (flags.length > 0) {
        console.log(`[Incomplete Pairs] ${flags.length} workers with missing scans:`, flags);
      }
    } catch (error) {
      console.error('[Incomplete Pairs Detection] Error:', error);
    }
  }, 15 * 60 * 1000);
}

export function stopSessionCalculator() {
  if (sessionInterval) clearInterval(sessionInterval);
  if (detectionInterval) clearInterval(detectionInterval);
  console.log('Session calculator stopped');
}
