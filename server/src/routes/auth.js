import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { sign, authenticate } from '../middleware/auth.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60_000, limit: 20, message: { error: 'Too many attempts, try again later' } });
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

router.post('/register', limiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    if (name.length < 2 || !validEmail(email) || password.length < 8)
      return res.status(400).json({ error: 'Enter your name, a valid email and a password of 8+ characters' });
    if (await User.exists({ email })) return res.status(409).json({ error: 'That email is already registered' });
    // The role is decided by the server only. It is never taken from the request body.
    const role = email === (process.env.ADMIN_EMAIL || '').toLowerCase().trim() ? 'admin' : 'member';
    const user = await User.create({ name, email, role, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: sign(user), user: user.toPublic() });
  } catch (e) {
    next(e);
  }
});

router.post('/login', limiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Wrong email or password' });
    res.json({ token: sign(user), user: user.toPublic() });
  } catch (e) {
    next(e);
  }
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user.toPublic() }));

export default router;
