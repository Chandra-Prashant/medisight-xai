const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  diagnosis: { type: String, required: true },
  confidence: { type: Number, required: true },
  imagePath: { type: String, required: true },
  heatmap: { type: String }, 
  
  // NEW FIELDS
  status: { type: String, enum: ['Pending', 'Correct', 'Incorrect'], default: 'Pending' },
  doctorNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);