const ActivityLog = require('../models/ActivityLog');

async function listLogs(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const logs = await ActivityLog.find().sort({ _id: -1 }).limit(limit);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

module.exports = { listLogs };
