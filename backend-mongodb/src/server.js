require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB, isConnected } = require('./config/db');
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
app.use(morgan('dev'));

// --- Health & readiness ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/ready', (req, res) => {
  const ready = isConnected();
  res.status(ready ? 200 : 503).json({ ready, db: 'mongodb' });
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
  res.json({ message: 'Library Management System API (MongoDB)', version: '1.0.0' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Library Management System API (MongoDB) listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
