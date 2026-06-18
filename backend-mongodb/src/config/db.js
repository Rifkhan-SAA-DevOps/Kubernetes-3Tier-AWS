const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/library_db';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

function isConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

module.exports = { connectDB, isConnected };
