import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { hashPassword, verifyPassword, hashToken, validLibrary } from './security.js';

const emptyLibrary = () => ({ list: [], likes: [], progress: {} });
const colors = ['#b56647', '#5b8b8e', '#8b71a8', '#758a55', '#a86c88'];

export function createApp(databasePath = process.env.DATABASE_PATH || 'data/afterglow.db') {
  if (databasePath !== ':memory:') mkdirSync(dirname(resolve(databasePath)), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, color TEXT NOT NULL, library TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS profiles_user ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);`);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '128kb' }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
    // Reject cross-origin writes. SameSite cookies provide an additional browser boundary.
    const origin = req.get('origin');
    let sameOrigin = !origin;
    if (origin) {
      try {
        const parsed = new URL(origin);
        sameOrigin =
          ['http:', 'https:'].includes(parsed.protocol) && parsed.host === req.get('host');
      } catch {
        sameOrigin = false;
      }
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !sameOrigin) {
      return res.status(403).json({ error: 'This request came from another website.' });
    }
    const token = (req.headers.cookie || '')
      .split('; ')
      .find((c) => c.startsWith('session='))
      ?.slice(8);
    if (token)
      req.user = db
        .prepare(
          'SELECT users.id, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE token = ? AND expires > ?',
        )
        .get(hashToken(token), Date.now());
    next();
  });
  const requireUser = (req, res, next) =>
    req.user ? next() : res.status(401).json({ error: 'Sign in to continue.' });
  const attempts = new Map();
  const rateLimit = (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until < now) attempts.delete(key);
    const entry = attempts.get(req.ip) || { count: 0, until: now + 15 * 60_000 };
    entry.count++;
    attempts.set(req.ip, entry);
    if (entry.count > 20)
      return res.status(429).json({ error: 'Too many attempts. Please try again in 15 minutes.' });
    next();
  };
  function startSession(res, userId) {
    db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
    const token = randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(
      hashToken(token),
      userId,
      Date.now() + 7 * 86400_000,
    );
    res.cookie('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 86400_000,
      path: '/',
    });
  }
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/session', (req, res) => res.json({ user: req.user || null }));
  app.post('/api/auth/:action', rateLimit, async (req, res) => {
    const { action } = req.params;
    if (!['signup', 'login'].includes(action)) return res.status(404).json({ error: 'Not found.' });
    const { email, password, name } = req.body || {};
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      typeof password !== 'string' ||
      password.length < 10 ||
      password.length > 128
    )
      return res
        .status(400)
        .json({ error: 'Enter a valid email and a password with 10–128 characters.' });
    const normalized = email.trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalized);
    if (action === 'signup') {
      if (user)
        return res.status(409).json({ error: 'An account with this email already exists.' });
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 24)
        return res.status(400).json({ error: 'Your profile name must be 1–24 characters.' });
      const passwordHash = await hashPassword(password);
      user = { id: randomUUID(), email: normalized };
      try {
        db.exec('BEGIN');
        db.prepare('INSERT INTO users VALUES (?, ?, ?)').run(user.id, normalized, passwordHash);
        db.prepare('INSERT INTO profiles VALUES (?, ?, ?, ?, ?)').run(
          randomUUID(),
          user.id,
          name.trim(),
          colors[0],
          JSON.stringify(emptyLibrary()),
        );
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        if (String(error).includes('UNIQUE'))
          return res.status(409).json({ error: 'An account with this email already exists.' });
        throw error;
      }
    } else if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    startSession(res, user.id);
    res.json({ user: { id: user.id, email: user.email } });
  });
  app.post('/api/logout', (req, res) => {
    const token = (req.headers.cookie || '')
      .split('; ')
      .find((c) => c.startsWith('session='))
      ?.slice(8);
    if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(hashToken(token));
    res.clearCookie('session', { path: '/' });
    res.json({ ok: true });
  });
  app.get('/api/profiles', requireUser, (req, res) =>
    res.json(
      db
        .prepare('SELECT id, name, color FROM profiles WHERE user_id = ? ORDER BY rowid')
        .all(req.user.id),
    ),
  );
  app.post('/api/profiles', requireUser, (req, res) => {
    const name = req.body?.name;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 24)
      return res.status(400).json({ error: 'Use a name between 1 and 24 characters.' });
    const count = db
      .prepare('SELECT COUNT(*) AS total FROM profiles WHERE user_id = ?')
      .get(req.user.id).total;
    if (count >= 5) return res.status(400).json({ error: 'You can create up to five profiles.' });
    const profile = { id: randomUUID(), name: name.trim(), color: colors[count] };
    db.prepare('INSERT INTO profiles VALUES (?, ?, ?, ?, ?)').run(
      profile.id,
      req.user.id,
      profile.name,
      profile.color,
      JSON.stringify(emptyLibrary()),
    );
    res.status(201).json(profile);
  });
  app.delete('/api/profiles/:id', requireUser, (req, res) => {
    const count = db
      .prepare('SELECT COUNT(*) AS total FROM profiles WHERE user_id = ?')
      .get(req.user.id).total;
    if (count <= 1) return res.status(400).json({ error: 'Keep at least one profile.' });
    const result = db
      .prepare('DELETE FROM profiles WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);
    if (!result.changes) return res.status(404).json({ error: 'Profile not found.' });
    res.json({ ok: true });
  });
  app.get('/api/profiles/:id/library', requireUser, (req, res) => {
    const profile = db
      .prepare('SELECT library FROM profiles WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    res.json(JSON.parse(profile.library));
  });
  app.put('/api/profiles/:id/library', requireUser, (req, res) => {
    if (!validLibrary(req.body)) return res.status(400).json({ error: 'Invalid library data.' });
    const result = db
      .prepare('UPDATE profiles SET library = ? WHERE id = ? AND user_id = ?')
      .run(JSON.stringify(req.body), req.params.id, req.user.id);
    if (!result.changes) return res.status(404).json({ error: 'Profile not found.' });
    res.json({ ok: true });
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use(express.static(resolve('dist')));
  app.get('/{*path}', (_req, res) => res.sendFile(resolve('dist/index.html')));
  app.use((error, _req, res, _next) => {
    const status = error.status || 500;
    if (status === 500) console.error(error);
    res.status(status).json({
      error:
        status === 500 ? 'Something went wrong. Please try again.' : 'Could not read this request.',
    });
  });
  return { app, db };
}
