const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { logActivity } = require('../utils/activityLogger');

const LOAN_DAYS = 14;
const FINE_PER_DAY = 0.5; // currency units per day overdue

async function borrowBook(req, res, next) {
  try {
    const bookId = req.params.bookId;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'No copies available' });
    }

    const already = await Borrow.hasActiveBorrow(bookId, userId);
    if (already) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DAYS);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    const borrow = await Borrow.create({ bookId, userId, dueDate: dueDateStr });
    await Book.decrementAvailable(bookId);
    await logActivity(req.user, 'BOOK_BORROWED', { bookId, borrowId: borrow.id, dueDate: dueDateStr });

    res.status(201).json(borrow);
  } catch (err) {
    next(err);
  }
}

async function returnBook(req, res, next) {
  try {
    const borrowId = req.params.id;
    const borrow = await Borrow.findById(borrowId);
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }
    if (req.user.role !== 'admin' && borrow.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to return this record' });
    }

    const today = new Date();
    const due = new Date(borrow.dueDate);
    let fine = 0;
    if (today > due) {
      const lateDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
      fine = +(lateDays * FINE_PER_DAY).toFixed(2);
    }

    const updated = await Borrow.markReturned(borrowId, fine);
    await Book.incrementAvailable(borrow.bookId);
    await logActivity(req.user, 'BOOK_RETURNED', { borrowId, fine });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function myBorrows(req, res, next) {
  try {
    const borrows = await Borrow.findByUser(req.user.id);
    res.json(borrows);
  } catch (err) {
    next(err);
  }
}

async function allBorrows(req, res, next) {
  try {
    const borrows = await Borrow.findAll();
    res.json(borrows);
  } catch (err) {
    next(err);
  }
}

module.exports = { borrowBook, returnBook, myBorrows, allBorrows };
