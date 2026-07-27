// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key_change_in_env';

// 1. Verify any logged-in user (Normal or Bureau)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Contains userId, email, role, isBureau
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// 2. Protect routes restricted to Bureau / Admin members ONLY
const requireBureau = (req, res, next) => {
  if (!req.user || !req.user.isBureau) {
    return res.status(403).json({ error: 'Access denied. Bureau permissions required.' });
  }
  next();
};

module.exports = { authenticateToken, requireBureau };