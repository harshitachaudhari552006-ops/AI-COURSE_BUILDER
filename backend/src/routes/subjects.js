import express from 'express';
import Subject from '../models/Subject.js';
import Semester from '../models/Semester.js';
import Teacher from '../models/Teacher.js';
import Module from '../models/Module.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all live classes (meeting status)
router.get('/live', authenticate, async (req, res) => {
  try {
    const liveSubjects = await Subject.find({
      isMeetingLive: true,
      isActive: true,
    }).populate('teacher', 'name email').populate('semester', 'number name');

    res.json(liveSubjects);
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Update meeting status for a subject (Teachers/Admins)
router.put('/:id/meeting', authenticate, async (req, res) => {
  try {
    const { meetingLink, isMeetingLive } = req.body;
    
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { meetingLink, isMeetingLive },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ 
      message: 'Meeting status updated successfully',
      meetingLink: subject.meetingLink,
      isMeetingLive: subject.isMeetingLive
    });
  } catch (error) {
    console.error('Error updating meeting status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

