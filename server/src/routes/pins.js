import { Router } from 'express';
import mongoose from 'mongoose';
import Pin from '../models/Pin.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
const validId = (id) => mongoose.isValidObjectId(id);

// Anyone (even guests) can read the map.
router.get('/', async (_req, res, next) => {
  try {
    const pins = await Pin.find().sort({ createdAt: -1 }).limit(500);
    res.json({ pins: pins.map((p) => p.toJSON()) });
  } catch (e) {
    next(e);
  }
});

// Members and admins can drop pins (one every 5 seconds).
router.post('/', authenticate, requireRole('member', 'admin'), async (req, res, next) => {
  try {
    const { lat, lon, m } = req.body;
    const note = String(req.body.note || '').trim().slice(0, 80);
    if (![lat, lon].every(Number.isFinite) || !Number.isInteger(m) || m < 0 || m > 4)
      return res.status(400).json({ error: 'Invalid pin' });
    const last = await Pin.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (last && Date.now() - last.createdAt.getTime() < 5000)
      return res.status(429).json({ error: 'Easy there. Wait a few seconds between pins.' });
    const pin = (await Pin.create({ user: req.user._id, lat, lon, m, note })).toJSON();
    req.app.get('io').emit('pin:new', pin);
    res.status(201).json(pin);
  } catch (e) {
    next(e);
  }
});

// Members and admins can send one kind word per pin.
router.post('/:id/kind', authenticate, requireRole('member', 'admin'), async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid pin' });
    const pin = await Pin.findOneAndUpdate(
      { _id: req.params.id, kindBy: { $ne: req.user._id } },
      { $addToSet: { kindBy: req.user._id }, $inc: { kind: 1 } },
      { new: true }
    );
    if (!pin) return res.status(409).json({ error: 'You already sent a kind word to this pin' });
    req.app.get('io').emit('pin:kind', { id: String(pin._id), kind: pin.kind });
    res.json({ kind: pin.kind });
  } catch (e) {
    next(e);
  }
});

// Owners can remove their own pins. Admins can remove any pin.
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid pin' });
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ error: 'Pin not found' });
    const isOwner = String(pin.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ error: 'You can only remove your own pins' });
    await pin.deleteOne();
    req.app.get('io').emit('pin:del', String(pin._id));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
