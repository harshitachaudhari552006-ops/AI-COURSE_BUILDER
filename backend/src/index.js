// Backend API Entry Point
import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import semesterRoutes from './routes/semesters.js';
import subjectRoutes from './routes/subjects.js';
import moduleRoutes from './routes/modules.js';
import materialRoutes from './routes/materials.js';
import questionPaperRoutes from './routes/questionPapers.js';
import aiRoutes from './routes/ai.js';

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    ok: true, 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'AI Course Builder API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/question-papers', questionPaperRoutes);
app.use('/api/ai', aiRoutes);

// Static files (Serve frontend build)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback for SPA (Single Page Application)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ message: 'API Route not found' });
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 AI Course Builder API listening on http://localhost:${port}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✨ VERSION: GEMINI-2.0-READY`);
});
