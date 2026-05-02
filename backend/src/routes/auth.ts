import { FastifyInstance } from 'fastify';
import { login, adminLogin, refreshToken } from '../services/authService.js';
import { logAudit } from '../services/auditService.js';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/worker/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    const tenantSlug = request.headers['x-tenant-slug'] as string;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    if (!tenantSlug) {
      return reply.code(400).send({ error: 'X-Tenant-Slug header is required' });
    }

    try {
      const result = await login({ email, password }, tenantSlug);

      await logAudit(
        {
          entityType: 'AUTH',
          entityId: result.user.id,
          userId: result.user.id,
          action: 'LOGIN',
          ipAddress: (request as any).ip || 'unknown',
        },
        tenantSlug
      );

      return result;
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });

  fastify.post('/auth/admin/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    const tenantSlug = request.headers['x-tenant-slug'] as string;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    if (!tenantSlug) {
      return reply.code(400).send({ error: 'X-Tenant-Slug header is required' });
    }

    try {
      const result = await adminLogin(email, password, tenantSlug);

      await logAudit(
        {
          entityType: 'AUTH',
          entityId: result.user.id,
          userId: result.user.id,
          action: 'ADMIN_LOGIN',
          ipAddress: (request as any).ip || 'unknown',
        },
        tenantSlug
      );

      return result;
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });

  fastify.post('/auth/refresh', async (request, reply) => {
    const { refreshToken: token } = request.body as { refreshToken: string };

    if (!token) {
      return reply.code(400).send({ error: 'Refresh token is required' });
    }

    try {
      const tokens = await refreshToken(token);
      return tokens;
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });
}
