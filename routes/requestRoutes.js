const express = require('express');
const router = express.Router();
const {
  submitRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
  exportRequestsCSV
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { uploadDemoAssets } = require('../middleware/uploadMiddleware');
const { submitLimiter } = require('../middleware/securityMiddleware');

// Public route to submit a demo request (with file uploads and spam protection)
router.post('/submit', submitLimiter, uploadDemoAssets, submitRequest);

// Protected admin routes for requests management
router.get('/', protect, getAllRequests);
router.get('/export', protect, exportRequestsCSV);
router.get('/:id', protect, getRequestById);
router.patch('/:id/status', protect, updateRequestStatus);
router.delete('/:id', protect, deleteRequest);

module.exports = router;
