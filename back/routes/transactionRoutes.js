
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transactionModel');
const { authenticateToken, requireBureau } = require('../middleware/authMiddleware');

// GET /api/transactions - List all transactions
router.get('/', authenticateToken, requireBureau, async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.status(200).json({ data: transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/summary - Get balance overview
router.get('/summary', authenticateToken, requireBureau, async (req, res) => {
  try {
    const summary = await Transaction.getSummary();
    res.status(200).json({ data: summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/project/:projectId - Get transactions for a specific project
router.get('/project/:projectId', authenticateToken, requireBureau, async (req, res) => {
  try {
    const transactions = await Transaction.findByProject(req.params.projectId);
    res.status(200).json({ data: transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions - Record a new transaction (Income/Expense)
router.post('/', authenticateToken, requireBureau, async (req, res) => {
  try {
    const { type, amount, category } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ error: 'Type, amount, and category are required' });
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({ error: "Type must be either 'Income' or 'Expense'" });
    }

    const transactionId = await Transaction.create(req.body);
    res.status(201).json({ message: 'Transaction recorded successfully', transactionId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;