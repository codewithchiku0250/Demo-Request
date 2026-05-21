require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// ----------------- SECURITY & UTILITY MIDDLEWARES -----------------
// Helmet helps secure Express apps by setting various HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Body Parsers for requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------- REGISTER API ROUTES -----------------
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// ----------------- SERVE STATIC ASSETS -----------------
// Serve the main public directory statically
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ----------------- ERROR HANDLING & FALLBACKS -----------------
// API 404 Handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint [${req.method}] ${req.originalUrl} not found.`
  });
});

// Fallback to SPA Client Home
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Global Server Error] ${err.stack}`);
  
  // Custom message for Multer size/format errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Upload failed: One of your files exceeds the 5MB size limit.'
    });
  }

  res.status(res.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Start listening
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port: ${PORT}`);
    console.log(`🔗 Local Address: http://localhost:${PORT}`);
    console.log(`💼 Access Client Application at the address above.`);
    console.log(`🔑 Access Admin Dashboard at: http://localhost:${PORT}/admin.html`);
    console.log(`======================================================\n`);
  });
}

// Export app for serverless deployments (like Vercel)
module.exports = app;
