const BookRequest = require('../models/BookRequest');
const { logActivity } = require('../utils/activityLogger');

async function createRequest(req, res, next) {
  try {
    const { title, author, notes } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'title is required' });
    }

    const request = await BookRequest.create({
      userId: req.user.id,
      username: req.user.username,
      title,
      author,
      notes,
    });

    await logActivity(req.user, 'BOOK_REQUESTED', { requestId: request.id, title: request.title });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

async function myRequests(req, res, next) {
  try {
    const requests = await BookRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

async function allRequests(req, res, next) {
  try {
    const requests = await BookRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

async function updateRequestStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be pending, approved or rejected' });
    }

    const request = await BookRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();
    await logActivity(req.user, 'BOOK_REQUEST_UPDATED', { requestId: request.id, status });
    res.json(request);
  } catch (err) {
    next(err);
  }
}

async function deleteRequest(req, res, next) {
  try {
    const existing = await BookRequest.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Request not found' });
    if (req.user.role !== 'admin' && existing.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this request' });
    }

    await BookRequest.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createRequest, myRequests, allRequests, updateRequestStatus, deleteRequest };
