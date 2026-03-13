import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import aiRouter from './routes/ai.js';
import authRouter from './routes/auth.js';
import exportRouter from './routes/export.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

// ─── Rate limiters ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts — please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded — please wait before sending more requests.' },
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0', timestamp: new Date().toISOString() });
});

// Routes (with rate limiting applied)
app.use('/api/ai', aiLimiter, aiRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/export', apiLimiter, exportRouter);

// Socket.IO for real-time collaboration
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('scene:update', (data) => {
    socket.broadcast.emit('scene:update', data);
  });

  socket.on('cursor:move', (data) => {
    socket.broadcast.emit('cursor:move', { ...data, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 AI-3Design Pro backend running on http://localhost:${PORT}`);
});
