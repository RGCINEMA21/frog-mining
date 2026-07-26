import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

export default async function authRoutes(fastify) {
  // Register new player
  fastify.post('/api/auth/register', async (request, reply) => {
    const { username } = request.body || {};

    if (!username || typeof username !== 'string') {
      return reply.code(400).send({ status: 'error', message: 'Username is required' });
    }

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      return reply.code(400).send({ status: 'error', message: 'Username must be 3-20 characters' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return reply.code(400).send({ status: 'error', message: 'Username can only contain letters, numbers, and underscores' });
    }

    // Check if username exists
    const existing = db.prepare('SELECT id FROM players WHERE username = ?').get(trimmed);
    if (existing) {
      return reply.code(409).send({ status: 'error', message: 'Username already taken' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      'INSERT INTO players (id, username, created_at, updated_at, last_login) VALUES (?, ?, ?, ?, ?)'
    ).run(id, trimmed, now, now, now);

    // Create auto mining record
    db.prepare(
      'INSERT INTO auto_mining (id, player_id, status) VALUES (?, ?, ?)'
    ).run(uuidv4(), id, 'inactive');

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id);

    return reply.send({
      status: 'success',
      message: 'Account created',
      data: { player },
    });
  });

  // Get player by ID (session check)
  fastify.get('/api/auth/session/:playerId', async (request, reply) => {
    const { playerId } = request.params;
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

    if (!player) {
      return reply.code(404).send({ status: 'error', message: 'Player not found' });
    }

    // Update last login
    db.prepare('UPDATE players SET last_login = ?, updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), new Date().toISOString(), playerId);

    return reply.send({
      status: 'success',
      data: { player },
    });
  });

  // Get player profile
  fastify.get('/api/players/:playerId', async (request, reply) => {
    const { playerId } = request.params;
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);

    if (!player) {
      return reply.code(404).send({ status: 'error', message: 'Player not found' });
    }

    return reply.send({
      status: 'success',
      data: { player },
    });
  });
}
