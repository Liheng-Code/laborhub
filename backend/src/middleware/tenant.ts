import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import pool from '../db/pool.js';

export function tenantMiddleware(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const tenantSlug = request.headers['x-tenant-slug'] as string;

    if (!tenantSlug) {
      return reply.code(400).send({ error: 'Missing X-Tenant-Slug header' });
    }

    const result = await pool.query(
      `SELECT id, slug, status FROM tenants WHERE slug = $1`,
      [tenantSlug]
    );

    if (!result.rows[0]) {
      return reply.code(404).send({ error: 'Tenant not found' });
    }

    if (result.rows[0].status !== 'active') {
      return reply.code(402).send({
        error: 'Subscription is not active. Please contact support.',
      });
    }

    (request as any).tenant = {
      id: result.rows[0].id,
      slug: result.rows[0].slug,
    };
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    tenant?: {
      id: string;
      slug: string;
    };
  }
}
