const express = require('express');
const { listMembers, getMember, updateMember, deleteMember } = require('../controllers/member.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, requireRole('admin'), listMembers);
router.get('/:id', authenticate, requireRole('admin'), getMember);
router.put('/:id', authenticate, requireRole('admin'), updateMember);
router.delete('/:id', authenticate, requireRole('admin'), deleteMember);

module.exports = router;
