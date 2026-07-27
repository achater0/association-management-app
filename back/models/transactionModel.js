
const db = require('../config/db');

const Transaction = {
  // 1. Log a new income or expense
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { type, amount, category, description, date, user_id, project_id } = data;
      const transactionDate = date || new Date().toISOString().split('T')[0];

      const sql = `
        INSERT INTO transactions (type, amount, category, description, date, user_id, project_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        sql,
        [type, amount, category, description, transactionDate, user_id || null, project_id || null],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // 2. Get all transactions with user & project details
  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT t.*, u.name as member_name, p.title as project_title
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        ORDER BY t.date DESC, t.id DESC
      `;

      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // 3. Financial Summary (Total Income, Total Expense, Net Balance)
  getSummary: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) as total_expense,
          COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END), 0) as net_balance
        FROM transactions
      `;

      db.get(sql, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // 4. Get transactions linked to a specific project
  findByProject: (projectId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT t.*, u.name as member_name 
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.project_id = ?
        ORDER BY t.date DESC
      `;

      db.all(sql, [projectId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  getUserFinancials: (userId) => {
    return new Promise((resolve, reject) => {
      const historySql = `
        SELECT id, type, amount, category, description, date, project_id
        FROM transactions
        WHERE user_id = ?
        ORDER BY date DESC, id DESC
      `;

      const summarySql = `
        SELECT
          COALESCE(SUM(CASE WHEN LOWER(category) LIKE '%cotisation%' OR LOWER(category) LIKE '%subscription%' OR LOWER(category) LIKE '%dues%' THEN amount ELSE 0 END), 0) as total_dues_paid,
          COALESCE(SUM(CASE WHEN LOWER(type) = 'income' AND LOWER(category) NOT LIKE '%cotisation%' AND LOWER(category) NOT LIKE '%subscription%' AND LOWER(category) NOT LIKE '%dues%' THEN amount ELSE 0 END), 0) as total_donations
        FROM transactions
        WHERE user_id = ?
      `;

      db.all(historySql, [userId], (err, historyRows) => {
        if (err) return reject(err);

        db.get(summarySql, [userId], (err, summaryRow) => {
          if (err) return reject(err);

          const ANNUAL_DUES_REQUIRED = 500;
          const totalDuesPaid = summaryRow ? summaryRow.total_dues_paid : 0;
          const totalDonations = summaryRow ? summaryRow.total_donations : 0;
          const amountDue = Math.max(0, ANNUAL_DUES_REQUIRED - totalDuesPaid);

          resolve({
            annual_dues_required: ANNUAL_DUES_REQUIRED,
            total_dues_paid: totalDuesPaid,
            total_donations: totalDonations,
            amount_due: amountDue,
            payment_status: amountDue === 0 ? 'Up to date' : 'Pending payment',
            history: historyRows || []
          });
        });
      });
    });
  }
};

module.exports = Transaction;