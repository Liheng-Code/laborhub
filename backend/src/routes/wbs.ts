import { FastifyInstance } from 'fastify';
import { getWbsNodes, getWbsOverlays, getWbsNodeDetail, createWbsNode, updateWbsNode, moveWbsNode, deleteWbsNode } from '../services/wbsService.js';
import { logAudit } from '../services/auditService.js';
import { z } from 'zod';
import type { DecodedToken } from '../types/index.js';

export default async function wbsRoutes(fastify: FastifyInstance) {
  // Validation schemas
  const wbsNodeCreateSchema = z.object({
    projectId: z.string().uuid(),
    parentId: z.string().uuid().nullable(),
    level: z.number().int().min(0),
    zone: z.string().optional(),
    label: z.string().min(1).max(255),
    plannedQuantity: z.number().optional(),
    plannedUnit: z.string().max(50).optional(),
    plannedStart: z.string().date().optional(),
    plannedEnd: z.string().date().optional(),
  });

  const wbsNodeUpdateSchema = z.object({
    label: z.string().min(1).max(255).optional(),
    zone: z.string().optional(),
    plannedQuantity: z.number().optional(),
    plannedUnit: z.string().max(50).optional(),
    plannedStart: z.string().date().optional(),
    plannedEnd: z.string().date().optional(),
  });

  const wbsNodeMoveSchema = z.object({
    newParentId: z.string().uuid().nullable(),
    newSortOrder: z.number().int(),
  });

  // GET /projects/:projectId/wbs - Get all WBS nodes for a project
  fastify.get('/projects/:projectId/wbs', async (request, reply) => {
    const user = (request as any).user as DecodedToken;
    const tenant = (request as any).tenant;
    const { projectId } = request.params as { projectId: string };

    try {
      // Verify project belongs to tenant
      const projectCheck = await fastify.pg.query(
        'SELECT id FROM projects WHERE id = $1',
        [projectId]
      );

      if (projectCheck.rowCount === 0) {
        return reply.code(404).send({ error: 'Project not found' });
      }

      const nodes = await getWbsNodes(projectId, tenant.slug);
      reply.send(nodes);
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // GET /projects/:projectId/wbs/overlays - Get WBS overlays for a specific date
  fastify.get('/projects/:projectId/wbs/overlays', async (request, reply) => {
    const tenant = (request as any).tenant;
    const { projectId } = request.params as { projectId: string };
    const { date } = request.query as { date?: string };

    try {
      const overlays = await getWbsOverlays(projectId, tenant.slug, date);
      reply.send(overlays);
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // GET /wbs-nodes/:id/detail - Get detailed info for a specific WBS node
  fastify.get('/wbs-nodes/:id/detail', async (request, reply) => {
    const user = (request as any).user as DecodedToken;
    const tenant = (request as any).tenant;
    const { id } = request.params as { id: string };
    const { date } = request.query as { date?: string };

    try {
      const detail = await getWbsNodeDetail(id, tenant.slug, date);
      if (!detail) {
        return reply.code(404).send({ error: 'WBS node not found' });
      }
      reply.send(detail);
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // POST /projects/:projectId/wbs - Create a new WBS node
  fastify.post('/projects/:projectId/wbs', async (request, reply) => {
    const user = (request as any).user as DecodedToken;
    const tenant = (request as any).tenant;
    const { projectId } = request.params as { projectId: string };

    // Check permissions - Engineer and above can create nodes
    if (!['ENGINEER', 'SUPERVISOR', 'PM', 'ADMIN'].includes(user.role)) {
      return reply.code(403).send({ error: 'Insufficient permissions' });
    }

    const parseResult = wbsNodeCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const { parentId, level, zone, label, plannedQuantity, plannedUnit, plannedStart, plannedEnd } = parseResult.data;

    try {
      // Verify project belongs to tenant
      const projectCheck = await fastify.pg.query(
        'SELECT id FROM projects WHERE id = $1',
        [projectId]
      );

      if (projectCheck.rowCount === 0) {
        return reply.code(404).send({ error: 'Project not found' });
      }

      // Verify parent exists in same project if provided
      if (parentId) {
        const parentCheck = await fastify.pg.query(
          'SELECT id FROM wbs_nodes WHERE id = $1 AND project_id = $2',
          [parentId, projectId]
        );

        if (parentCheck.rowCount === 0) {
          return reply.code(400).send({ error: 'Parent node not found in project' });
        }
      }

      const node = await createWbsNode(
        projectId,
        parentId,
        level,
        zone,
        label,
        plannedQuantity,
        plannedUnit,
        plannedStart,
        plannedEnd,
        tenant.slug
      );

      await logAudit(
        {
          entityType: 'WBS_NODE',
          entityId: node.id,
          userId: user.userId,
          action: 'WBS_NODE_CREATED',
          ipAddress: request.ip || 'unknown',
        },
        tenant.slug
      );

      reply.code(201).send(node);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // PATCH /wbs-nodes/:id - Update a WBS node
  fastify.patch('/wbs-nodes/:id', async (request, reply) => {
    const user = (request as any).user as DecodedToken;
    const tenant = (request as any).tenant;
    const { id } = request.params as { id: string };

    // Check permissions - Engineer and above can update nodes
    if (!['ENGINEER', 'SUPERVISOR', 'PM', 'ADMIN'].includes(user.role)) {
      return reply.code(403).send({ error: 'Insufficient permissions' });
    }

    const parseResult = wbsNodeUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    try {
      const existingNode = await fastify.pg.query(
        'SELECT id, project_id, updated_at FROM wbs_nodes WHERE id = $1',
        [id]
      );

      if (existingNode.rowCount === 0) {
        return reply.code(404).send({ error: 'WBS node not found' });
      }

      // Check if user has access to this project
      const projectCheck = await fastify.pg.query(
        `SELECT p.id FROM projects p
         JOIN wbs_nodes wn ON p.id = wn.project_id
         WHERE wn.id = $1`,
        [id]
      );

      if (projectCheck.rowCount === 0) {
        return reply.code(404).send({ error: 'WBS node not found' });
      }

      // Optimistic locking - check if node has been modified
      const ifMatch = request.headers['if-match'];
      if (ifMatch) {
        const currentNode = await fastify.pg.query(
          'SELECT updated_at FROM wbs_nodes WHERE id = $1',
          [id]
        );

        if (currentNode.rows[0].updated_at.toISOString() !== ifMatch) {
          return reply.code(412).send({ error: 'Resource has been modified' });
        }
      }

      const updatedNode = await updateWbsNode(
        id,
        parseResult.data,
        tenant.slug
      );

      await logAudit(
        {
          entityType: 'WBS_NODE',
          entityId: id,
          userId: user.userId,
          action: 'WBS_NODE_UPDATED',
          ipAddress: request.ip || 'unknown',
        },
        tenant.slug
      );

      reply.send(updatedNode);
    } catch (error: any) {
      if (error.code === 'OPTIMISTIC_LOCK') {
        return reply.code(412).send({ error: error.message });
      }
      reply.code(400).send({ error: error.message });
    }
  });

  // POST /wbs-nodes/:id/move - Move a WBS node (reparent/reorder)
  fastify.post('/wbs-nodes/:id/move', async (request, reply) => {
    const user = (request as any).user as DecodedToken;
    const tenant = (request as any).tenant;
    const { id } = request.params as { id: string };

    // Check permissions - Engineer can move within project, PM+ can move across projects
    const canMoveWithinProject = ['ENGINEER', 'SUPERVISOR', 'PM', 'ADMIN'].includes(user.role);
    const canMoveAcrossProjects = ['PM', 'ADMIN'].includes(user.role);

    if (!canMoveWithinProject) {
      return reply.code(403).send({ error: 'Insufficient permissions' });
    }

    const parseResult = wbsNodeMoveSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const { newParentId, newSortOrder } = parseResult.data;

    try {
      const existingNode = await fastify.pg.query(
        'SELECT id, project_id FROM wbs_nodes WHERE id = $1',
        [id]
      );

      if (existingNode.rowCount === 0) {
        return reply.code(404).send({ error: 'WBS node not found' });
      }

      const projectId = existingNode.rows[0].project_id;

      // Check if user has access to this project
      const projectAccessCheck = await fastify.pg.query(
        `SELECT p.id FROM projects p
         JOIN wbs_nodes wn ON p.id = wn.project_id
         WHERE wn.id = $1`,
        [id]
      );

      if (projectAccessCheck.rowCount === 0) {
        return reply.code(404).send({ error: 'WBS node not found' });
      }

      // Verify new parent exists and is in accessible project
      let targetProjectId = projectId; // Default to same project
      if (newParentId !== null) {
        const parentCheck = await fastify.pg.query(
          'SELECT id, project_id FROM wbs_nodes WHERE id = $1',
          [newParentId]
        );

        if (parentCheck.rowCount === 0) {
          return reply.code(400).send({ error: 'Parent node not found' });
        }

        targetProjectId = parentCheck.rows[0].project_id;

        // Check if user can access the target project
        const targetProjectAccess = await fastify.pg.query(
          `SELECT p.id FROM projects p
           JOIN wbs_nodes wn ON p.id = wn.project_id
           WHERE wn.id = $1`,
          [newParentId]
        );

        if (targetProjectAccess.rowCount === 0) {
          return reply.code(403).send({ error: 'Cannot access target project' });
        }

        // Only PM+ can move across projects
        if (targetProjectId !== projectId && !canMoveAcrossProjects) {
          return reply.code(403).send({ error: 'Insufficient permissions to move across projects' });
        }
      }

      const movedNode = await moveWbsNode(
        id,
        newParentId,
        newSortOrder,
        tenant.slug
      );

      await logAudit(
        {
          entityType: 'WBS_NODE',
          entityId: id,
          userId: user.userId,
          action: 'WBS_NODE_MOVED',
          ipAddress: request.ip || 'unknown',
        },
        tenant.slug
      );

      reply.send(movedNode);
    } catch (error: any) {
      if (error.code === 'CYCLE_DETECTED') {
        return reply.code(409).send({ error: error.message });
      }
      if (error.code === 'DEPTH_EXCEEDED') {
        return reply.code(409).send({ error: error.message });
      }
      reply.code(400).send({ error: error.message });
    }
  });

  // DELETE /wbs-nodes/:id - Delete a WBS node (only if empty)
  fastify.delete('/wbs-nodes/:id', async (request, reply) => {
    const user = (request as any).user as DecodedToken;
    const tenant = (request as any).tenant;
    const { id } = request.params as { id: string };

    // Check permissions - PM and above can delete nodes
    if (!['PM', 'ADMIN'].includes(user.role)) {
      return reply.code(403).send({ error: 'Insufficient permissions' });
    }

    try {
      const existingNode = await fastify.pg.query(
        'SELECT id, project_id FROM wbs_nodes WHERE id = $1',
        [id]
      );

      if (existingNode.rowCount === 0) {
        return reply.code(404).send({ error: 'WBS node not found' });
      }

      const projectId = existingNode.rows[0].project_id;

      // Check if user has access to this project
      const projectCheck = await fastify.pg.query(
        `SELECT p.id FROM projects p
         JOIN wbs_nodes wn ON p.id = wn.project_id
         WHERE wn.id = $1`,
        [id]
      );

      if (projectCheck.rowCount === 0) {
        return reply.code(404).send({ error: 'WBS node not found' });
      }

      await deleteWbsNode(id, tenant.slug);

      await logAudit(
        {
          entityType: 'WBS_NODE',
          entityId: id,
          userId: user.userId,
          action: 'WBS_NODE_DELETED',
          ipAddress: request.ip || 'unknown',
        },
        tenant.slug
      );

      reply.send({ success: true });
    } catch (error: any) {
      if (error.code === 'NOT_EMPTY') {
        return reply.code(409).send({ error: error.message });
      }
      reply.code(400).send({ error: error.message });
    }
  });
}