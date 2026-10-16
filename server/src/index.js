import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import pinRoutes from './routes/pins.js';

if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
if ((process.env.JWT_SECRET || '').length < 32) throw new Error('JWT_SECRET must be at least 32 characters');

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: origins } });
app.set('io', io);

app.use(helmet());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '10kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120 }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/pins', pinRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

await mongoose.connect(process.env.MONGO_URI);
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Vibe Map API running on :${port}`));
