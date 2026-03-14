import express from 'express';
import Subject from '../models/Subject.js';
import Semester from '../models/Semester.js';
import Teacher from '../models/Teacher.js';
import Module from '../models/Module.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get subjects by semester
router.get('/semester/:semesterId', authenticate, async (req, res) => {
  try {
    const subjects = await Subject.find({
      semester: req.params.semesterId,
      isActive: true,
    })
      .populate('teacher', 'name email')
      .populate('modules', 'number title')
      .sort({ code: 1 });

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single subject
router.get('/:id', authenticate, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('semester', 'number name')
      .populate('teacher', 'name email department')
      .populate({
        path: 'modules',
        populate: {
          path: 'materials',
          select: 'title type fileName',
        },
      });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

