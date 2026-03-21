import express from 'express';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get semesters, optionally filtered by syllabus type
router.get('/', authenticate, async (req, res) => {
  try {
    const { syllabusType } = req.query;
    const query = { isActive: true };
    if (syllabusType) {
      query.syllabusType = syllabusType;
    }

    const semesters = await Semester.find(query)
      .sort({ number: 1 })
      .lean();

    for (let sem of semesters) {
      const subjects = await Subject.find({ semester: sem._id }).select('code name');
      sem.subjects = subjects;
    }

    res.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single semester
router.get('/:id', authenticate, async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id)
      .populate({
        path: 'subjects',
        populate: {
          path: 'teacher',
          select: 'name email',
        },
      });
    
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    res.json(semester);
  } catch (error) {
    console.error('Error fetching semester:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

