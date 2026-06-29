const express = require('express');
const { listReviews, createReview, deleteReview } = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/book/:bookId', listReviews);
router.post('/book/:bookId', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
