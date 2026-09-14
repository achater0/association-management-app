const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Project = require('../models/projectModel');
const db = require('../config/db');
const { authenticateToken, requireBureau } = require('../middleware/authMiddleware');

const annualReportStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `annual-report-${Date.now()}${ext}`);
    }
});
const annualReportUpload = multer({ storage: annualReportStorage });


router.get('/', authenticateToken, async (req, res) => {
    try {
        const projects = await Project.findAll();
        res.status(200).json({
            message: 'Projects retrieved successfully',
            projects: projects
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({
            message: 'Project retrieved successfully',
            project: project
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticateToken, requireBureau, async (req, res) => {
    try {
        const {title} = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const newProjectId = await Project.create(req.body);
        res.status(201).json({
            message: 'Project created successfully',
            projectId: newProjectId
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.patch('/:id', authenticateToken, requireBureau, async (req, res) => {
    try {
        const changes = await Project.update(req.params.id, req.body);
        if (changes === 0) {
            return res.status(404).json({ message: 'Project not found or no changes made' });
        }
        res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/members', authenticateToken, requireBureau, async (req, res) => {
    try {
        const { user_id , committee_role } = req.body;
        if (!user_id || !committee_role) {
            return res.status(400).json({ message: 'User ID and committee role are required' });
        }
        await Project.addMember(req.params.id, user_id, committee_role);
        res.status(201).json({ message: 'Member added to project successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/projects/:id/report - End-of-project report (available to authenticated users)
router.get('/:id/report', authenticateToken, async (req, res) => {
    try {
        const projectId = req.params.id;
        const sql = `SELECT id, type, amount, category, description, date, document_path, bank_proof, invoice_number, voucher_number, supplier_name, user_id
                     FROM transactions WHERE project_id = ? ORDER BY date DESC`;
        db.all(sql, [projectId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const income = rows.filter(r => r.type === 'Income');
            const expenses = rows.filter(r => r.type === 'Expense');
            const report = {
                projectId,
                total_income: income.reduce((s, r) => s + (r.amount || 0), 0),
                total_expense: expenses.reduce((s, r) => s + (r.amount || 0), 0),
                transactions: rows
            };
            res.status(200).json({ report });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id/members/:userId', authenticateToken, requireBureau, async (req, res) => {
    try {
        const changes = await Project.removeMember(req.params.id, req.params.userId);
        if (changes === 0) {
            return res.status(404).json({ message: 'Project or member not found' });
        }
        res.status(200).json({ message: 'Member removed from project successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/projects/reports/annual?year=YYYY - Annual treasury activity report
router.get('/reports/annual', authenticateToken, async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const start = `${year}-01-01`;
        const end = `${year}-12-31`;
        const sql = `SELECT id, type, amount, category, description, date, document_path, bank_proof, invoice_number, voucher_number, supplier_name, project_id, user_id
                     FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC`;
        db.all(sql, [start, end], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const total_income = rows.filter(r => r.type === 'Income').reduce((s, r) => s + (r.amount || 0), 0);
            const total_expense = rows.filter(r => r.type === 'Expense').reduce((s, r) => s + (r.amount || 0), 0);
            res.status(200).json({ year, total_income, total_expense, net_balance: total_income - total_expense, transactions: rows });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/reports/annual/latest', authenticateToken, async (req, res) => {
    try {
        const sql = `SELECT * FROM annual_reports ORDER BY year DESC, id DESC LIMIT 1`;
        db.get(sql, [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'No annual report published yet.' });
            res.status(200).json({ report: row });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/reports/annual', authenticateToken, requireBureau, annualReportUpload.single('report_file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Annual report file is required.' });
        }
        const year = parseInt(req.body.year) || new Date().getFullYear();
        const filePath = `/uploads/${req.file.filename}`;
        const insertSql = `INSERT INTO annual_reports (year, file_path) VALUES (?, ?)`;
        db.run(insertSql, [year, filePath], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Annual report published successfully', report: { id: this.lastID, year, file_path: filePath } });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;    