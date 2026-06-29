const express = require('express');
const { listBooks, getBook, createBook, updateBook, deleteBook } = require('../controllers/book.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', listBooks);
router.get('/:id', getBook);
router.post('/', authenticate, requireRole('admin'), createBook);
router.put('/:id', authenticate, requireRole('admin'), updateBook);
router.delete('/:id', authenticate, requireRole('admin'), deleteBook);

module.exports = router;
