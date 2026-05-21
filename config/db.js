const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/demo_requests', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if connection fails
    });
    console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[Database Warning] The application is running, but database-related actions will fail until MongoDB is active.`);
    // In local development or serverless environments, we allow server startup to succeed even without DB running immediately
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
