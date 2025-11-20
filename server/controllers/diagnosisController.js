const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Report = require('../models/Report');

// 1. Handle the Request
exports.analyzeXray = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    console.log(`Received file: ${req.file.path}`);

    // 2. Prepare form data for Python API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    // 3. Call the Python AI Engine
    // Note: 'maxBodyLength' and 'maxContentLength' needed for large images
    const pythonResponse = await axios.post(process.env.PYTHON_API_URL, formData, {
      headers: { ...formData.getHeaders() },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    const aiResult = pythonResponse.data;
    console.log("Diagnosis:", aiResult.diagnosis);
    console.log("Has Heatmap?", aiResult.heatmap ? "YES" : "NO");
    if (aiResult.heatmap) {
        console.log("Heatmap Length:", aiResult.heatmap.length);
        console.log("Heatmap Start:", aiResult.heatmap.substring(0, 50)); // Should see "data:image/jpeg;base64,..."
    }

    // 4. Save Result to MongoDB
    const newReport = new Report({
      imagePath: req.file.path,
      diagnosis: aiResult.diagnosis,
      confidence: aiResult.confidence,
      heatmap: aiResult.heatmap // Storing base64 directly (simple for prototype)
    });

    await newReport.save();

    // 5. Return to Frontend (or Postman)
    res.json({
      success: true,
      data: newReport
    });

  } catch (error) {
    console.error("Error in Diagnosis Controller:", error.message);
    res.status(500).json({ error: "Analysis Failed", details: error.message });
  }
};

// NEW: Update Report Status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const report = await Report.findByIdAndUpdate(
      id, 
      { status, doctorNotes: notes },
      { new: true } 
    );

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

// NEW: Get All Reports (For Sidebar)
exports.getHistory = async (req, res) => {
  try {
    // Get last 10 reports, newest first
    const reports = await Report.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
};