import express from 'express';
import Module from '../models/Module.js';
import Material from '../models/Material.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get modules by subject
router.get('/subject/:subjectId', authenticate, async (req, res) => {
  try {
    const modules = await Module.find({ subject: req.params.subjectId })
      .populate('materials', 'title type fileName fileSize')
      .sort({ number: 1 });

    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single module with materials
router.get('/:id', authenticate, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate({
        path: 'subject',
        select: 'code name',
        populate: {
          path: 'teacher',
          select: 'name email',
        },
      })
      .populate({
        path: 'materials',
        populate: {
          path: 'uploadedBy',
          select: 'name',
        },
      });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update module YouTube links
router.put('/:id/youtube-links', authenticate, async (req, res) => {
  try {
    const { youtubeUrls } = req.body;
    
    if (!Array.isArray(youtubeUrls)) {
      return res.status(400).json({ message: 'youtubeUrls must be an array' });
    }

    const module = await Module.findByIdAndUpdate(
      req.params.id,
      { youtubeUrls },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Error updating module YouTube links:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update module NPTEL links
router.put('/:id/nptel-links', authenticate, async (req, res) => {
  try {
    const { nptelUrls } = req.body;
    
    if (!Array.isArray(nptelUrls)) {
      return res.status(400).json({ message: 'nptelUrls must be an array' });
    }

    const module = await Module.findByIdAndUpdate(
      req.params.id,
      { nptelUrls },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Error updating module NPTEL links:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

