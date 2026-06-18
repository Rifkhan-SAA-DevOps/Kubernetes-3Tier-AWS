const mongoose = require('mongoose');
const { applyToJSON } = require('../config/toJSON');

const borrowSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed' },
    fineAmount: { type: Number, default: 0 },
  },
  { timestamps: false }
);

applyToJSON(borrowSchema);

module.exports = mongoose.model('Borrow', borrowSchema);
