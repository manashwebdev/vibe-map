import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  return { id: String(this._id), name: this.name, role: this.role };
};

export default mongoose.model('User', userSchema);
