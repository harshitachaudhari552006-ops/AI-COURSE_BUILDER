import express from 'express';
import QuestionPaper from '../models/QuestionPaper.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getS3ObjectStream } from '../services/s3Service.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Get question papers by subject
router.get('/subject/:subjectId', authenticate, async (req, res) => {
  try {
    const papers = await QuestionPaper.find({ subject: req.params.subjectId })
      .populate('subject', 'code name')
      .sort({ year: -1, semester: -1 });

    res.json(papers);
  } catch (error) {
    console.error('Error fetching question papers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get question papers by semester
router.get('/semester/:semesterNumber', authenticate, async (req, res) => {
  try {
    const papers = await QuestionPaper.find({ semester: req.params.semesterNumber })
      .populate('subject', 'code name')
      .sort({ year: -1, subject: 1 });

    res.json(papers);
  } catch (error) {
    console.error('Error fetching question papers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download question paper
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found' });
    }

    if (paper.storageType === 'S3') {
      const response = await getS3ObjectStream(paper.s3Key);
      res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${paper.fileName}"`);
      return response.Body.pipe(res);
    }

    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', 'questionPapers', paper.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, paper.fileName);
  } catch (error) {
    console.error('Error downloading question paper:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload question paper
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { subjectId, title, year, semester, examType } = req.body;

    if (!subjectId || !title || !year || !semester) {
      return res.status(400).json({ message: 'Subject ID, title, year, and semester are required' });
    }

    const paper = new QuestionPaper({
      title,
      year: parseInt(year),
      semester: parseInt(semester),
      subject: subjectId,
      filePath: req.file.filename,
      fileName: req.file.originalname,
      examType: examType || 'END_SEM',
      uploadedBy: req.student._id, // In production, use teacher ID
    });

    await paper.save();
    res.status(201).json(paper);
  } catch (error) {
    console.error('Error uploading question paper:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Link an S3 object as a question paper
router.post('/s3/link', authenticate, async (req, res) => {
  try {
    const { subjectId, title, year, semester, examType, s3Key, fileSize } = req.body;

    if (!subjectId || !title || !year || !semester || !s3Key) {
      return res.status(400).json({ message: 'Subject ID, title, year, semester, and S3 Key are required' });
    }

    const paper = new QuestionPaper({
      title,
      year: parseInt(year),
      semester: parseInt(semester),
      subject: subjectId,
      storageType: 'S3',
      s3Key,
      fileName: s3Key.split('/').pop(),
      examType: examType || 'END_SEM',
      uploadedBy: req.student ? req.student._id : req.user._id,
    });

    await paper.save();
    res.status(201).json(paper);
  } catch (error) {
    console.error('Error linking S3 question paper:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

