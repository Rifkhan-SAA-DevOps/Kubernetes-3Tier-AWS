const Book = require('../models/Book');
const Review = require('../models/Review');
const { logActivity } = require('../utils/activityLogger');

/**
 * Attaches avgRating/reviewCount (rounded to 1 decimal) to a list of book
 * documents, matching the shape returned by the MySQL backend.
 */
async function withRatings(books) {
  const single = !Array.isArray(books);
  const list = single ? [books] : books;
  if (list.length === 0) return single ? null : [];

  const bookIds = list.filter(Boolean).map((b) => b._id);
  const ratings = await Review.aggregate([
    { $match: { bookId: { $in: bookIds } } },
    { $group: { _id: '$bookId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);

  const ratingMap = {};
  ratings.forEach((r) => {
    ratingMap[r._id.toString()] = {
      avgRating: Math.round(r.avgRating * 10) / 10,
      reviewCount: r.reviewCount,
    };
  });

  const result = list.map((b) => {
    if (!b) return b;
    const json = b.toJSON();
    const r = ratingMap[json.id] || { avgRating: 0, reviewCount: 0 };
    return { ...json, ...r };
  });

  return single ? result[0] : result;
}

async function listBooks(req, res, next) {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { author: regex }, { isbn: regex }];
    }
    if (category) {
      filter.category = category;
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(await withRatings(books));
  } catch (err) {
    next(err);
  }
}

async function getBook(req, res, next) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(await withRatings(book));
  } catch (err) {
    next(err);
  }
}

async function createBook(req, res, next) {
  try {
    const { title, author, isbn, category, description, publishedYear, totalCopies, imageUrl } = req.body;
    if (!title || !author || !totalCopies) {
      return res.status(400).json({ message: 'title, author and totalCopies are required' });
    }

    const book = await Book.create({
      title, author, isbn, category, description, publishedYear,
      totalCopies, availableCopies: totalCopies, imageUrl,
    });

    await logActivity(req.user, 'BOOK_CREATED', { bookId: book.id, title: book.title });
    res.status(201).json(await withRatings(book));
  } catch (err) {
    next(err);
  }
}

async function updateBook(req, res, next) {
  try {
    const existing = await Book.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Book not found' });

    const {
      title = existing.title,
      author = existing.author,
      isbn = existing.isbn,
      category = existing.category,
      description = existing.description,
      publishedYear = existing.publishedYear,
      totalCopies = existing.totalCopies,
      availableCopies = existing.availableCopies,
      imageUrl = existing.imageUrl,
    } = req.body;

    Object.assign(existing, { title, author, isbn, category, description, publishedYear, totalCopies, availableCopies, imageUrl });
    await existing.save();

    await logActivity(req.user, 'BOOK_UPDATED', { bookId: existing.id });
    res.json(await withRatings(existing));
  } catch (err) {
    next(err);
  }
}

async function deleteBook(req, res, next) {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    await logActivity(req.user, 'BOOK_DELETED', { bookId: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listBooks, getBook, createBook, updateBook, deleteBook };
