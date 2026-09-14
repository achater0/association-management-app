const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


const app = express();
const PORT = process.env.PORT || 8080;
const db = require('./config/db');
const createTables = require('./config/schema');

createTables();


// Middleware

app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies

// Serve uploaded documents (receipts, CIN scans, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const notifyRoutes = require('./routes/notifyRoutes');

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notify', notifyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running perfectly!' });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});