const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { logActivity } = require('../utils/activityLogger');

const LOAN_DAYS = 14;
const FINE_PER_DAY = 0.5; // currency units per day overdue

/**
 * Flattens a populated Borrow document into the same shape
 * the MySQL backend returns (bookTitle, author, username denormalized).
 */
function formatBorrow(b) {
  return {
    id: b._id.toString(),
    bookId: b.bookId._id.toString(),
    userId: b.userId._id.toString(),
    bookTitle: b.bookId.title,
    author: b.bookId.author,
    username: b.userId.username,
    borrowDate: b.borrowDate,
    dueDate: b.dueDate,
    returnDate: b.returnDate,
    status: b.status,
    fineAmount: b.fineAmount,
  };
}

async function borrowBook(req, res, next) {
  try {
    const bookId = req.params.bookId;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'No copies available' });
    }

    const already = await Borrow.findOne({ bookId, userId, status: 'borrowed' });
    if (already) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DAYS);

    const borrow = await Borrow.create({ bookId, userId, dueDate });
    book.availableCopies -= 1;
    await book.save();

    await logActivity(req.user, 'BOOK_BORROWED', { bookId, borrowId: borrow.id, dueDate });

    const populated = await Borrow.findById(borrow.id).populate('bookId', 'title author').populate('userId', 'username');
    res.status(201).json(formatBorrow(populated));
  } catch (err) {
    next(err);
  }
}

async function returnBook(req, res, next) {
  try {
    const borrowId = req.params.id;
    const borrow = await Borrow.findById(borrowId).populate('bookId', 'title author').populate('userId', 'username');
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }
    if (req.user.role !== 'admin' && borrow.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to return this record' });
    }

    const today = new Date();
    const due = new Date(borrow.dueDate);
    let fine = 0;
    if (today > due) {
      const lateDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
      fine = +(lateDays * FINE_PER_DAY).toFixed(2);
    }

    borrow.status = 'returned';
    borrow.returnDate = today;
    borrow.fineAmount = fine;
    await borrow.save();

    const book = await Book.findById(borrow.bookId._id);
    if (book && book.availableCopies < book.totalCopies) {
      book.availableCopies += 1;
      await book.save();
    }

    await logActivity(req.user, 'BOOK_RETURNED', { borrowId, fine });
    res.json(formatBorrow(borrow));
  } catch (err) {
    next(err);
  }
}

async function myBorrows(req, res, next) {
  try {
    const borrows = await Borrow.find({ userId: req.user.id })
      .sort({ _id: -1 })
      .populate('bookId', 'title author')
      .populate('userId', 'username');
    res.json(borrows.map(formatBorrow));
  } catch (err) {
    next(err);
  }
}

async function allBorrows(req, res, next) {
  try {
    const borrows = await Borrow.find()
      .sort({ _id: -1 })
      .populate('bookId', 'title author')
      .populate('userId', 'username');
    res.json(borrows.map(formatBorrow));
  } catch (err) {
    next(err);
  }
}

module.exports = { borrowBook, returnBook, myBorrows, allBorrows };
