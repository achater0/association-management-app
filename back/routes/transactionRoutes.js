
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transactionModel');
const { authenticateToken, requireBureau } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// GET /api/transactions - List all transactions
router.get('/', authenticateToken, requireBureau, async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/summary - Get balance overview
router.get('/summary', authenticateToken, requireBureau, async (req, res) => {
  try {
    const summary = await Transaction.getSummary();
    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/project/:projectId - Get transactions for a specific project
// Allow authenticated users (including subscribers) to view transactions for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.findByProject(req.params.projectId);
    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions - Record a new transaction (Income/Expense)
// Accepts multipart uploads for 'document' (receipt) and 'bank_proof' (check/wire)
router.post('/', authenticateToken, requireBureau, upload.fields([{ name: 'document', maxCount: 1 }, { name: 'bank_proof', maxCount: 1 }]), async (req, res) => {
  try {
    const { type, amount, category, payment_method } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ error: 'Type, amount, and category are required' });
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({ error: "Type must be either 'Income' or 'Expense'" });
    }

    // If files were uploaded, set the document paths so they can be saved in DB
    if (req.files && req.files.document && req.files.document[0]) {
      req.body.document_path = `/uploads/${req.files.document[0].filename}`;
    }
    if (req.files && req.files.bank_proof && req.files.bank_proof[0]) {
      req.body.bank_proof = `/uploads/${req.files.bank_proof[0].filename}`;
    }

    // If payment method is Bank, ensure bank_proof present
    if ((payment_method && payment_method.toLowerCase() === 'bank') && !req.body.bank_proof) {
      return res.status(400).json({ error: 'Bank operations require a bank proof file (check photo or transfer order).' });
    }

    // Ensure numeric amount
    req.body.amount = Number(req.body.amount);

    const transactionId = await Transaction.create(req.body);
    res.status(201).json({ message: 'Transaction recorded successfully', transactionId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;