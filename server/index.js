const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
// We don't even need the 'cors' library for this method

dotenv.config();
const app = express();

// --- MANUAL CORS OVERRIDE (The Nuclear Option) ---
app.use((req, res, next) => {
  // 1. Allow connections from ANYWHERE
  res.header("Access-Control-Allow-Origin", "*");
  
  // 2. Allow these specific headers (Content-Type is crucial)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  // 3. Allow these HTTP methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // 4. Handle "Preflight" OPTIONS requests immediately
  // Browsers send a "Check" request (OPTIONS) before the real request. 
  // We must say "OK" immediately.
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
  }
  
  next();
});
// -------------------------------------------------

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect Database
connectDB();

// Routes
app.use('/api', diagnosisRoutes);

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Node.js Gatekeeper running on port ${PORT}`);
});