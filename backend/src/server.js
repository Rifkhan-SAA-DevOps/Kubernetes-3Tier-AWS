require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require("fs");
const path = require("path");
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
const PORT = process.env.PORT || 5000;

let isReady = false;
let isLive = true;
let startupError = null;

app.use(helmet());
app.use(cors());
app.use(express.json());

// -------------------------------
// Health, Liveness, Readiness
// -------------------------------

// General health endpoint
// Good for browser/manual checking/monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'library-management-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    ready: isReady,
    live: isLive
  });
});

// Liveness endpoint
// Kubernetes uses this to know: should I restart this container?
// IMPORTANT: Do not check MySQL here.
app.get('/api/live', (req, res) => {
  if (isLive) {
    return res.status(200).json({
      live: true,
      message: 'Backend process is alive'
    });
  }

  return res.status(500).json({
    live: false,
    message: 'Backend process is unhealthy'
  });
});

// Readiness endpoint
// Kubernetes uses this to know: should this Pod receive traffic?
// This can check MySQL because real requests need DB.
app.get('/api/ready', async (req, res) => {
  if (!isReady) {
    return res.status(503).json({
      ready: false,
      message: 'Backend is not ready yet',
      startupError: startupError ? startupError.message : null
    });
  }

  try {
    await checkConnection();

    return res.status(200).json({
      ready: true,
      db: 'mysql',
      message: 'Backend is ready to receive traffic'
    });
  } catch (err) {
    return res.status(503).json({
      ready: false,
      db: 'mysql',
      message: 'Database is not ready',
      error: err.message
    });
  }
});

// Testing endpoint only for learning Kubernetes livenessProbe.
// Do not use this in real production.
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/make-unhealthy', (req, res) => {
    isLive = false;

    res.status(500).json({
      message: 'Backend is now unhealthy. Kubernetes livenessProbe should restart this container.'
    });
  });
}

// -------------------------------
// API routes
// -------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/book-requests', bookRequestRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'Library Management System API (MySQL)',
    version: '1.0.0'
  });
});

// This endpoint creates CPU pressure so HPA has something to react to
app.get("/api/cpu", (req, res) => {
  const start = Date.now();

  // Create CPU work for around 700 milliseconds
  while (Date.now() - start < 700) {
    Math.sqrt(Math.random() * 1000000);
  }

  res.json({
    message: "CPU load generated",
    durationMs: Date.now() - start,
    pod: process.env.HOSTNAME || "unknown"
  });
});

// 404 and error handlers must stay after all routes
app.use(notFound);
app.use(errorHandler);

// Listen on 0.0.0.0 for Docker/Kubernetes
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Library Management System API (MySQL) listening on port ${PORT}`);
});

// Initialize DB schema.
// Readiness stays false until this finishes successfully.
ensureSchema()
  .then(() => {
    isReady = true;
    startupError = null;
    console.log('Database schema checked successfully');
    console.log('Backend is now ready to receive traffic');
  })
  .catch((err) => {
    isReady = false;
    startupError = err;
    console.error('Schema check failed:', err.message);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Marking backend as not ready.');
  isReady = false;
});

module.exports = app;