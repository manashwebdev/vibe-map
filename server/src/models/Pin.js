import mongoose from 'mongoose';

const pinSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lat: { type: Number, required: true, min: -1.58, max: 1.58 }, // radians
    lon: { type: Number, required: true, min: -3.15, max: 3.15 }, // radians
    m: { type: Number, required: true, min: 0, max: 4 }, // mood index
    note: { type: String, default: '', maxlength: 80, trim: true },
    kind: { type: Number, default: 0 },
    kindBy: { type: [mongoose.Schema.Types.ObjectId], default: [], select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, r) => ({
        id: String(r._id),
        by: String(r.user),
        lat: r.lat,
        lon: r.lon,
        m: r.m,
        note: r.note,
        kind: r.kind,
        t: new Date(r.createdAt).getTime(),
      }),
    },
  }
);

export default mongoose.model('Pin', pinSchema);
