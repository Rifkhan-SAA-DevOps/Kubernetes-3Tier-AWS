const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkey_change_me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userDoc = await User.create({ username, email, passwordHash, role: 'member' });
    const user = userDoc.toJSON();
    const token = signToken(user);

    await logActivity(user, 'USER_REGISTERED', { username });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const userDoc = await User.findOne({ username }).select('+passwordHash');
    if (!userDoc) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, userDoc.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userDoc.toJSON();
    delete user.passwordHash;
    const token = signToken(user);
    await logActivity(user, 'USER_LOGIN', { username });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    if (!username || !email) {
      return res.status(400).json({ message: 'username and email are required' });
    }

    const conflicting = await User.findOne({ username });
    if (conflicting && conflicting.id !== req.user.id) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const userDoc = await User.findById(req.user.id).select('+passwordHash');
    if (!userDoc) return res.status(404).json({ message: 'User not found' });

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'currentPassword is required to set a new password' });
      }
      const valid = await bcrypt.compare(currentPassword, userDoc.passwordHash);
      if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
      userDoc.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    userDoc.username = username;
    userDoc.email = email;
    await userDoc.save();

    const user = userDoc.toJSON();
    delete user.passwordHash;
    const token = signToken(user);
    await logActivity(req.user, 'PROFILE_UPDATED', {});
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateMe };
