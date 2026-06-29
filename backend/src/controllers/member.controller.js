const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

async function listMembers(req, res, next) {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getMember(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Member not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMember(req, res, next) {
  try {
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Member not found' });

    const { username = existing.username, email = existing.email, role = existing.role } = req.body;
    const updated = await User.update(req.params.id, { username, email, role });
    await logActivity(req.user, 'MEMBER_UPDATED', { memberId: req.params.id });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteMember(req, res, next) {
  try {
    const ok = await User.remove(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Member not found' });
    await logActivity(req.user, 'MEMBER_DELETED', { memberId: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listMembers, getMember, updateMember, deleteMember };
