const express = require('express');
const { listLogs } = require('../controllers/log.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, requireRole('admin'), listLogs);

module.exports = router;
