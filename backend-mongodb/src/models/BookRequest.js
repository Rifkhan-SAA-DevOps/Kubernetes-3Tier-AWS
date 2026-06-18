const mongoose = require('mongoose');
const { applyToJSON } = require('../config/toJSON');

const bookRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

applyToJSON(bookRequestSchema);

module.exports = mongoose.model('BookRequest', bookRequestSchema);
