const mongoose = require('mongoose');
const { applyToJSON } = require('../config/toJSON');

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: 'anonymous' },
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

applyToJSON(activityLogSchema);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
