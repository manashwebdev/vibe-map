import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const sign = (user) => jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Authentication: who is calling? The role is always read from the database, never from the token.
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Log in first' });
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(sub);
    if (!user) return res.status(401).json({ error: 'Account not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

// Authorization: is this role allowed to do this?
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'You do not have permission to do that' });
