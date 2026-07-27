const bcrypt = require('bcryptjs');
const db = require('../config/db');

const User = {
  create: async (userData) => {
    const { name, email, password, role, cin_number, phone } = userData;
    const userRole = role || 'Subscriber'; // Capitalized for consistency

    if (!password) {
      throw new Error('Password is required');
    }
    
    const password_hash = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (name, email, password_hash, role, cin_number, phone) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

      db.run(sql, [name, email, password_hash, userRole, cin_number, phone], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  findAll: () => { // Renamed from findALL to findAll
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, email, role, cin_number, phone FROM users`;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, email, role, cin_number, phone FROM users WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE email = ?`;
      db.get(sql, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  updateRole: (id, newRole) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE users SET role = ? WHERE id = ?`;
      db.run(sql, [newRole, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }   
};

module.exports = User;