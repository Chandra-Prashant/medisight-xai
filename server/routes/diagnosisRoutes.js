const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  analyzeXray, 
  updateReportStatus, 
  getHistory 
} = require('../controllers/diagnosisController');

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST /api/analyze
// Middleware 'upload.single' processes the file first, then calls our controller
router.post('/analyze', upload.single('image'), analyzeXray);
router.put('/reports/:id', updateReportStatus); // New Route
router.get('/history', getHistory);

module.exports = router;