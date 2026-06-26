require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');


const { checkConnection, ensureSchema } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const memberRoutes = require('./routes/member.routes');
const borrowRoutes = require('./routes/borrow.routes');
const reviewRoutes = require('./routes/review.routes');
const logRoutes = require('./routes/log.routes');
const bookRequestRoutes = require('./routes/bookRequest.routes');
const messageRoutes = require('./routes/message.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


// --- Health & readiness ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/ready', async (req, res) => {
  try {
    await checkConnection();
    res.json({ ready: true, db: 'mysql' });
  } catch (err) {
    res.status(503).json({ ready: false, db: 'mysql', error: err.message });
  }
});

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/book-requests', bookRequestRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Library Management System API (MySQL)', version: '1.0.0' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Library Management System API (MySQL) listening on port ${PORT}`);
});

ensureSchema().catch((err) => {
  console.error('Schema check failed:', err.message);
});

module.exports = app;
