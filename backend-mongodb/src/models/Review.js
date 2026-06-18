const mongoose = require('mongoose');
const { applyToJSON } = require('../config/toJSON');

const reviewSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

applyToJSON(reviewSchema);

module.exports = mongoose.model('Review', reviewSchema);
