// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key_change_in_env';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Compare incoming plain password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Normalize role: map common French labels to canonical internal role values
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

    const canonicalRole = roleMap[user.role] || user.role;

    // Determine bureau membership from canonical roles
    const bureauRoles = ['Admin', 'President', 'Vice-President', 'Treasurer', 'Secretary', 'Secretary-General', 'Vice-Secretary-General'];
    const isBureau = bureauRoles.includes(canonicalRole);

    // 4. Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: canonicalRole,
        isBureau
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Respond with Token + User info (excluding password hash)
    res.status(200).json({
      message: 'Login successful',
      token,
        user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: canonicalRole,
        isBureau // Frontend uses this flag to route to Normal vs Admin Dashboard
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;