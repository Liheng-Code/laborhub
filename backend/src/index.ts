import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import tenantRoutes from './routes/tenant.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { authMiddleware } from './middleware/auth.js';
import { startSessionCalculator } from './jobs/sessionCalculatorJob.js';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4028';

fastify.register(cors, {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug'],
});

fastify.register(tenantRoutes);

fastify.register(async function (fastify) {
  fastify.register(tenantMiddleware);

  fastify.register(authRoutes);

  fastify.register(async function (protectedRoutes) {
    protectedRoutes.register(authMiddleware);

    protectedRoutes.register(attendanceRoutes);
  });
});

fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

async function start() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`LaborHub Backend running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    const tenantSlug = process.env.DEFAULT_TENANT_SLUG;
    if (tenantSlug) {
      startSessionCalculator(tenantSlug);
    } else {
      console.log('No DEFAULT_TENANT_SLUG set. Session calculator not started.');
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
