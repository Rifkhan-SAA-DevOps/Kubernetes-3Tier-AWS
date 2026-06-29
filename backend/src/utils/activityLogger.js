const ActivityLog = require('../models/ActivityLog');

/**
 * Fire-and-forget activity logger. Never throws so it can't break the main request flow.
 */
async function logActivity(user, action, details = {}) {
  try {
    await ActivityLog.create({
      userId: user?.id || null,
      username: user?.username || 'anonymous',
      action,
      details,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}

module.exports = { logActivity };
