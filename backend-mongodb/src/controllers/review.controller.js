const Review = require('../models/Review');
const { logActivity } = require('../utils/activityLogger');

async function listReviews(req, res, next) {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

async function createReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    const review = await Review.create({
      bookId: req.params.bookId,
      userId: req.user.id,
      username: req.user.username,
      rating,
      comment,
    });

    await logActivity(req.user, 'REVIEW_CREATED', { bookId: req.params.bookId, rating });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (req.user.role !== 'admin' && review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this review' });
    }

    await review.deleteOne();
    await logActivity(req.user, 'REVIEW_DELETED', { reviewId: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listReviews, createReview, deleteReview };
