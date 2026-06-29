const Book = require('../models/Book');
const { logActivity } = require('../utils/activityLogger');

async function listBooks(req, res, next) {
  try {
    const { search, category } = req.query;
    const books = await Book.findAll({ search, category });
    res.json(books);
  } catch (err) {
    next(err);
  }
}

async function getBook(req, res, next) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
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
    const book = await Book.create({ title, author, isbn, category, description, publishedYear, totalCopies, imageUrl });
    await logActivity(req.user, 'BOOK_CREATED', { bookId: book.id, title: book.title });
    res.status(201).json(book);
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

    const book = await Book.update(req.params.id, {
      title, author, isbn, category, description, publishedYear, totalCopies, availableCopies, imageUrl,
    });
    await logActivity(req.user, 'BOOK_UPDATED', { bookId: book.id });
    res.json(book);
  } catch (err) {
    next(err);
  }
}

async function deleteBook(req, res, next) {
  try {
    const ok = await Book.remove(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Book not found' });
    await logActivity(req.user, 'BOOK_DELETED', { bookId: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listBooks, getBook, createBook, updateBook, deleteBook };
