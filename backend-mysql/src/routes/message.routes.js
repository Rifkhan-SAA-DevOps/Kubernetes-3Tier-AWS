const express = require('express');
const { sendMessage, myThread, listConversations, threadWith } = require('../controllers/message.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, sendMessage);
router.get('/mine', authenticate, myThread);
router.get('/conversations', authenticate, requireRole('admin'), listConversations);
router.get('/thread/:userId', authenticate, requireRole('admin'), threadWith);

module.exports = router;
