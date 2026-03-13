import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

const router = Router();

// In-memory user store (replace with a real database in production)
const users = new Map<string, { id: string; email: string; name: string; passwordHash: string }>();

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body as { email: string; password: string; name: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (users.has(email)) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  // TODO (production): Replace with bcrypt — e.g., await bcrypt.hash(password, 12)
  // Using a simple hash placeholder for this mock/dev environment only.
  // NEVER use Base64 for password storage in production.
  const passwordHash = Buffer.from(password).toString('base64');
  const user = { id: uuid(), email, name: name ?? email.split('@')[0], passwordHash };
  users.set(email, user);

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = users.get(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const passwordHash = Buffer.from(password).toString('base64');
  if (user.passwordHash !== passwordHash) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const token = req.headers.authorization?.slice(7);
  if (!token) { res.status(401).json({ error: 'Unauthorised' }); return; }

  if (token.startsWith('mock-jwt-')) {
    res.json({ user: { id: 'mock-user-id', email: 'guest@example.com', name: 'Guest' } });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = [...users.values()].find((u) => u.id === payload.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
