const Message = require('../models/Message');

/** Member sends a message to the library. */
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
      // Admin replying to a specific user
      const { toUserId, toUsername } = req.body;
      if (!toUserId) return res.status(400).json({ message: 'toUserId is required for admin replies' });
      recipientId = Number(toUserId);
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

/** Member fetches their own thread. */
async function myThread(req, res, next) {
  try {
    const msgs = await Message.getMyThread(req.user.id);
    res.json(msgs);
  } catch (err) {
    next(err);
  }
}

/** Admin: list all conversations. */
async function listConversations(req, res, next) {
  try {
    const convos = await Message.listConversations();
    res.json(convos);
  } catch (err) {
    next(err);
  }
}

/** Admin: thread with a specific user; also marks their messages as read. */
async function threadWith(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    await Message.markThreadRead(userId);
    const msgs = await Message.getThreadWith(userId);
    res.json(msgs);
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, myThread, listConversations, threadWith };
