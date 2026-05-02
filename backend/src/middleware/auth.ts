import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import type { DecodedToken } from '../types/index.js';
import { verifyToken } from '../services/authService.js';

export function authMiddleware(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.code(401).send({ error: 'No authorization header' });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);

      (request as any).user = decoded;
    } catch {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user as DecodedToken;

    if (!roles.includes(user.role)) {
      return reply.code(403).send({
        error: 'Insufficient permissions',
        required: roles,
        current: user.role,
      });
    }
  };
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: DecodedToken;
  }
}
