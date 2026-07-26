/**
 * Frog Mining — Server Entry Point.
 * Placeholder — to be implemented in Phase 4+.
 */
import Fastify from 'fastify';

const server = Fastify({ logger: true });

server.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    await server.listen({ port: process.env.PORT || 3001 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
