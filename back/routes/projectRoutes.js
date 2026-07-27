const express = require('express');
const router = express.Router();
const Project = require('../models/projectModel');
const { authenticateToken, requireBureau } = require('../middleware/authMiddleware');


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

module.exports = router;    