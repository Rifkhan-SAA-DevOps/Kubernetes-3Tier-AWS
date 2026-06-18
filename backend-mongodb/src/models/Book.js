const mongoose = require('mongoose');
const { applyToJSON } = require('../config/toJSON');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true, unique: true, sparse: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    publishedYear: { type: Number },
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

applyToJSON(bookSchema);

module.exports = mongoose.model('Book', bookSchema);
