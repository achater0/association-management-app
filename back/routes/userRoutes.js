// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const { authenticateToken, requireBureau } = require('../middleware/authMiddleware');


router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.findAll();
        
        res.status(200).json({
            message: 'Users retrieved successfully',
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const member = await User.findById(req.params.id);
        
        if (!member) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User retrieved successfully',
            user: member
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Permission check
    if (!req.user.isBureau && req.user.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ error: 'Access denied. You can only view your own balance.' });
    }

    // 2. Fetch user to confirm existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Delegate financial calculation & history to the Transaction model
    const financials = await Transaction.getUserFinancials(userId);

    res.status(200).json({
      user,
      financials
    });
  } catch (error) {
    console.error('Error calculating user balance:', error);
    res.status(500).json({ error: error.message || 'Internal server error calculating balance.' });
  }
});

// POST: Create a new user
router.post('/', authenticateToken, requireBureau, async (req, res) => {
  try {
    // Pass req.body directly to your model
    const newUserId = await User.create(req.body);
    
    res.status(201).json({ 
      message: 'User created successfully', 
      userId: newUserId 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/role', authenticateToken, requireBureau, async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }
        const changes = await User.updateRole(req.params.id, role);
        if (changes === 0) {
            return res.status(404).json({ message: 'User not found or role unchanged' });
        }
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;