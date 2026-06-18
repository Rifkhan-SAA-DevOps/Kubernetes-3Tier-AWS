const Message = require('../models/Message');

async function sendMessage(req, res, next) {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Message body is required' });
    }

    const isAdmin = req.user.role === 'admin';

    let recipientId = null;
    let recipientUsername = null;

    if (isAdmin) {
      const { toUserId, toUsername } = req.body;
      if (!toUserId) return res.status(400).json({ message: 'toUserId is required for admin replies' });
      recipientId = toUserId;
      recipientUsername = toUsername || null;
    }

    const msg = await Message.create({
      senderId: req.user.id,
      senderUsername: req.user.username,
      recipientId,
      recipientUsername,
      body: body.trim(),
    });

    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
}

async function myThread(req, res, next) {
  try {
    const userId = req.user.id;
    const msgs = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    next(err);
  }
}

async function listConversations(req, res, next) {
  try {
    // Distinct users who sent messages to the library (recipientId = null)
    const senderIds = await Message.distinct('senderId', { recipientId: null });

    const convos = await Promise.all(
      senderIds.map(async (uid) => {
        const latest = await Message.findOne({
          $or: [{ senderId: uid }, { recipientId: uid }],
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          senderId: uid,
          recipientId: null,
          isRead: false,
        });

        return {
          userId: uid,
          username: latest.senderUsername,
          lastMessage: latest.body,
          lastAt: latest.createdAt,
          unreadCount,
        };
      })
    );

    convos.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    res.json(convos);
  } catch (err) {
    next(err);
  }
}

async function threadWith(req, res, next) {
  try {
    const userId = req.params.userId;
    // Mark user's incoming messages as read
    await Message.updateMany({ senderId: userId, recipientId: null, isRead: false }, { isRead: true });

    const msgs = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    }).sort({ createdAt: 1 });

    res.json(msgs);
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, myThread, listConversations, threadWith };
