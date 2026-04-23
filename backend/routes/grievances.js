const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const protect = require('../middleware/protect');

// All routes below require authentication
router.use(protect);

// POST /api/grievances — Submit grievance
router.post('/', async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const grievance = await Grievance.create({
      title,
      description,
      category,
      student: req.student.id,
    });

    res.status(201).json({ message: 'Grievance submitted successfully', grievance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/grievances/search?title=xyz — Search (must be BEFORE /:id)
router.get('/search', async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ message: 'Search query "title" is required' });
    }

    const grievances = await Grievance.find({
      student: req.student.id,
      title: { $regex: title, $options: 'i' },
    }).sort({ createdAt: -1 });

    res.status(200).json({ count: grievances.length, grievances });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/grievances — View all grievances for logged-in student
router.get('/', async (req, res) => {
  try {
    const grievances = await Grievance.find({ student: req.student.id }).sort({ createdAt: -1 });
    res.status(200).json({ count: grievances.length, grievances });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/grievances/:id — View single grievance
router.get('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Ensure the grievance belongs to the logged-in student
    if (grievance.student.toString() !== req.student.id) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    res.status(200).json({ grievance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/grievances/:id — Update grievance
router.put('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    if (grievance.student.toString() !== req.student.id) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own grievances' });
    }

    const { title, description, category, status } = req.body;

    if (title) grievance.title = title;
    if (description) grievance.description = description;
    if (category) grievance.category = category;
    if (status) grievance.status = status;

    await grievance.save();

    res.status(200).json({ message: 'Grievance updated successfully', grievance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/grievances/:id — Delete grievance
router.delete('/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    if (grievance.student.toString() !== req.student.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own grievances' });
    }

    await grievance.deleteOne();

    res.status(200).json({ message: 'Grievance deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
