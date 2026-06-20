const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;


// Middleware

app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies

// Connect to the database
connectDB();
// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running perfectly!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});