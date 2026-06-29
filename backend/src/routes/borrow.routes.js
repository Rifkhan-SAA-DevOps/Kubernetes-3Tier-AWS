const express = require('express');
const { borrowBook, returnBook, myBorrows, allBorrows } = require('../controllers/borrow.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/:bookId', authenticate, borrowBook);
router.post('/:id/return', authenticate, returnBook);
router.get('/my', authenticate, myBorrows);
router.get('/', authenticate, requireRole('admin'), allBorrows);

module.exports = router;
