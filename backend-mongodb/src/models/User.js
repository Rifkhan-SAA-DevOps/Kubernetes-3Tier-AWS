const mongoose = require('mongoose');
const { applyToJSON } = require('../config/toJSON');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

applyToJSON(userSchema);

module.exports = mongoose.model('User', userSchema);
