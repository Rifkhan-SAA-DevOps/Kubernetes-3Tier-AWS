const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

async function listMembers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
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
    Object.assign(existing, { username, email, role });
    await existing.save();

    await logActivity(req.user, 'MEMBER_UPDATED', { memberId: req.params.id });
    res.json(existing);
  } catch (err) {
    next(err);
  }
}

async function deleteMember(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Member not found' });
    await logActivity(req.user, 'MEMBER_DELETED', { memberId: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listMembers, getMember, updateMember, deleteMember };
