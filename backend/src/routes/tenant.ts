import { FastifyInstance } from 'fastify';
import { createTenant, getTenantBySlug } from '../services/tenantService.js';
import { logAudit } from '../services/auditService.js';

export default async function tenantRoutes(fastify: FastifyInstance) {
  fastify.post('/tenants/signup', async (request, reply) => {
    const body = request.body as any;
    const { companyName, slug, plan, adminEmail, adminPassword, adminFullName, region } = body;

    if (!companyName || !slug || !adminEmail || !adminPassword || !adminFullName) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    const existing = await getTenantBySlug(slug);
    if (existing) {
      return reply.code(409).send({ error: 'Tenant slug already taken' });
    }

    try {
      const result = await createTenant({
        companyName,
        slug,
        plan: plan || 'starter',
        adminEmail,
        adminPassword,
        adminFullName,
        region,
      });

      await logAudit(
        {
          entityType: 'TENANT',
          entityId: result.tenantId,
          userId: result.adminId,
          action: 'TENANT_CREATED',
          ipAddress: request.ip || 'unknown',
        },
        result.schemaName.replace('tenant_', '')
      );

      return reply.code(201).send({
        tenantId: result.tenantId,
        adminId: result.adminId,
        message: 'Tenant created successfully',
      });
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/tenants/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    try {
      const tenant = await getTenantBySlug(slug);

      if (!tenant) {
        return reply.code(404).send({ error: 'Tenant not found' });
      }

      return tenant;
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });
}
