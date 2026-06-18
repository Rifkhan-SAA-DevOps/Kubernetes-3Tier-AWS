const express = require('express');
const {
  createRequest,
  myRequests,
  allRequests,
  updateRequestStatus,
  deleteRequest,
} = require('../controllers/bookRequest.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, createRequest);
router.get('/mine', authenticate, myRequests);
router.get('/', authenticate, requireRole('admin'), allRequests);
router.put('/:id', authenticate, requireRole('admin'), updateRequestStatus);
router.delete('/:id', authenticate, deleteRequest);

module.exports = router;
