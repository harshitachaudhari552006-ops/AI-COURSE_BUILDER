import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  generateExtraNotes,
  generateNumericals,
  generateExamPoints,
  generateYouTubeLinks,
  generatePredictedQuestions,
  getAIContent,
  chatWithAI,
} from '../services/aiService.js';
import AIQuestion from '../models/AIQuestion.js';
import Module from '../models/Module.js';

const router = express.Router();

// Get AI content for a module/topic
router.get('/content/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { topic } = req.query;

    if (!topic) {
      return res.status(400).json({ message: 'Topic parameter is required' });
    }

    const content = await getAIContent(moduleId, topic);
    res.json(content || { message: 'No AI content available' });
  } catch (error) {
    console.error('Error fetching AI content:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Generate extra notes
router.post('/notes/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { topic, officialNotes } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const notes = await generateExtraNotes(moduleId, topic, officialNotes);
    res.json({ extraNotes: notes });
  } catch (error) {
    console.error('Error generating notes:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Generate numericals
router.post('/numericals/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { topic, count } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const numericals = await generateNumericals(moduleId, topic, count || 5);
    res.json({ numericals });
  } catch (error) {
    console.error('Error generating numericals:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Generate exam points
router.post('/exam-points/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const points = await generateExamPoints(moduleId, topic);
    res.json({ examPoints: points });
  } catch (error) {
    console.error('Error generating exam points:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Generate YouTube links
router.post('/youtube/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const links = await generateYouTubeLinks(moduleId, topic);
    res.json({ youtubeLinks: links });
  } catch (error) {
    console.error('Error generating YouTube links:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get predicted questions
router.get('/questions/:subjectId', authenticate, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { moduleId, topic } = req.query;

    const query = { subject: subjectId, isPredicted: true };
    if (moduleId) query.module = moduleId;
    if (topic) query.topic = topic;

    const questions = await AIQuestion.find(query)
      .populate('subject', 'code name')
      .populate('module', 'number title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate predicted questions
router.post('/questions/generate', authenticate, async (req, res) => {
  try {
    const { subjectId, moduleId, topic, count } = req.body;

    if (!subjectId || !topic) {
      return res.status(400).json({ message: 'Subject ID and topic are required' });
    }

    const questions = await generatePredictedQuestions(
      subjectId,
      moduleId,
      topic,
      count || 10
    );

    res.json({ questions, count: questions.length });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Chat with AI
router.post('/chat/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { topic, question, history } = req.body;

    if (!topic || !question) {
      return res.status(400).json({ message: 'Topic and question are required' });
    }

    const answer = await chatWithAI(moduleId, topic, question, history || []);
    res.json({ answer });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;

