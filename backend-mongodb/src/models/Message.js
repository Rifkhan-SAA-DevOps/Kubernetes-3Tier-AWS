const mongoose = require('mongoose');
const { applyToJSON } = require('../config/toJSON');

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderUsername: { type: String, required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    recipientUsername: { type: String, default: null },
    body: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

applyToJSON(messageSchema);

module.exports = mongoose.model('Message', messageSchema);
