import { FastifyInstance } from 'fastify';
import { submitScan, getTodayScans, getFlaggedScans, verifyFaceScan } from '../services/attendanceService.js';
import { logAudit } from '../services/auditService.js';

export default async function attendanceRoutes(fastify: FastifyInstance) {
  fastify.post('/scans/submit', async (request, reply) => {
    const user = (request as any).user;
    const tenant = (request as any).tenant;

    const body = request.body as any;
    const { workerId, projectId, scanType, lat, lng, facePhotoUrl, faceMatchScoreLocal } = body;

    if (!workerId || !projectId || !scanType) {
      return reply.code(400).send({ error: 'workerId, projectId, and scanType are required' });
    }

    try {
      const result = await submitScan(
        { workerId, projectId, scanType, lat, lng, facePhotoUrl, faceMatchScoreLocal },
        tenant.slug
      );

      await logAudit(
        {
          entityType: 'ATTENDANCE',
          entityId: result.scanId,
          userId: user.userId,
          action: 'SCAN_SUBMITTED',
          ipAddress: request.ip || 'unknown',
        },
        tenant.slug
      );

      return {
        accepted: true,
        localScore: faceMatchScoreLocal,
        queuedForVerify: true,
        scanId: result.scanId,
      };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.get('/scans/today', async (request, reply) => {
    const user = (request as any).user;
    const tenant = (request as any).tenant;

    const workerId = (request.query as any)?.workerId || user.userId;

    try {
      const scans = await getTodayScans(workerId, tenant.slug);
      return scans;
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/scans/flagged', async (request, reply) => {
    const tenant = (request as any).tenant;

    try {
      const scans = await getFlaggedScans(tenant.slug);
      return scans;
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  fastify.post('/scans/manual-override', async (request, reply) => {
    const user = (request as any).user;
    const tenant = (request as any).tenant;

    const body = request.body as any;
    const { workerId, date, scanType, manualTime, reason } = body;

    if (!workerId || !date || !scanType || !manualTime || !reason) {
      return reply.code(400).send({ error: 'All fields are required' });
    }

    return reply.code(501).send({ error: 'Manual override not yet implemented' });
  });

  fastify.post('/scans/:scanId/verify-face', async (request, reply) => {
    const tenant = (request as any).tenant;
    const { scanId } = request.params as { scanId: string };
    const { score } = request.body as { score: number };

    if (typeof score !== 'number' || score < 0 || score > 1) {
      return reply.code(400).send({ error: 'Valid score (0-1) is required' });
    }

    try {
      await verifyFaceScan(scanId, score, tenant.slug);

      await logAudit(
        {
          entityType: 'ATTENDANCE',
          entityId: scanId,
          userId: (request as any).user.userId,
          action: 'FACE_VERIFIED',
          ipAddress: request.ip || 'unknown',
        },
        tenant.slug
      );

      return { success: true };
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });
}
