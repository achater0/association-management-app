// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const { authenticateToken, requireBureau } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer setup for CIN uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `cin-${req.params.id || 'user'}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });


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
    // Validate required fields
    const { name, email, password, role, cin_number, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    // Normalize role map (accept French labels or canonical values)
    const roleMap = {
      'Président': 'President',
      'Vice-président': 'Vice-President',
      'Trésorier': 'Treasurer',
      'Vice-trésorier': 'Vice-Treasurer',
      'Secrétaire': 'Secretary',
      'Secrétaire général': 'Secretary-General',
      'Vice-secrétaire général': 'Vice-Secretary-General',
      'Conseiller': 'Counselor',
      'Abonné': 'Subscriber'
    };

    const canonicalRole = roleMap[role] || role || 'Subscriber';

    const newUserId = await User.create({ name, email, password, role: canonicalRole, cin_number, phone });

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
    const actorId = req.user.userId;
    const actorRole = req.user.role; // should be canonical role sent in JWT
    const targetId = parseInt(req.params.id, 10);

    // Only President can change roles
    if (actorRole !== 'President') {
      return res.status(403).json({ message: 'Only the President can change member roles' });
    }

    // President cannot change own role
    if (actorId === targetId) {
      return res.status(403).json({ message: 'President cannot change their own role' });
    }

    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    // Normalize incoming role
    const roleMap = {
      'Président': 'President',
      'Vice-président': 'Vice-President',
      'Trésorier': 'Treasurer',
      'Vice-trésorier': 'Vice-Treasurer',
      'Secrétaire': 'Secretary',
      'Secrétaire général': 'Secretary-General',
      'Vice-secrétaire général': 'Vice-Secretary-General',
      'Conseiller': 'Counselor',
      'Abonné': 'Subscriber'
    };

    const canonicalRole = roleMap[role] || role;

    const changes = await User.updateRole(targetId, canonicalRole);
    if (changes === 0) {
      return res.status(404).json({ message: 'User not found or role unchanged' });
    }
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/:id/upload-cin - upload scanned CIN for a user
router.post('/:id/upload-cin', authenticateToken, upload.single('cin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Permission: owner or bureau
    if (!req.user.isBureau && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only upload your own CIN.' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const relativePath = `/uploads/${req.file.filename}`;

    // Update user record with cin_file path
    const sql = `UPDATE users SET cin_file = ? WHERE id = ?`;
    db.run(sql, [relativePath, userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Return updated user
      User.findById(userId).then((user) => {
        res.status(200).json({ message: 'CIN uploaded', user });
      }).catch((e) => res.status(500).json({ error: e.message }));
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/upload-payment-proof - subscriber uploads proof of bank transfer / payment
router.post('/:id/upload-payment-proof', authenticateToken, upload.single('payment_proof'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!req.user.isBureau && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only upload your own payment proof.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No payment proof uploaded' });
    }

    const relativePath = `/uploads/${req.file.filename}`;
    const sql = `UPDATE users SET payment_proof = ?, payment_proof_status = 'pending' WHERE id = ?`;
    db.run(sql, [relativePath, userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      User.findById(userId).then((user) => {
        res.status(200).json({ message: 'Payment proof uploaded and sent for validation', user });
      }).catch((e) => res.status(500).json({ error: e.message }));
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;