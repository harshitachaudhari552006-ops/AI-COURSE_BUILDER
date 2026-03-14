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
import fs from 'fs';

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


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/question-papers', questionPaperRoutes);
app.use('/api/ai', aiRoutes);

// Static files (Serve frontend build)
const frontendPath = path.resolve(__dirname, '../../frontend');
let frontendDistPath = path.join(frontendPath, 'dist');

console.log('📂 Deployment Diagnostic Info:');
console.log('   - Current __dirname:', __dirname);
console.log('   - Checking Default Path:', frontendDistPath);

if (!fs.existsSync(frontendDistPath)) {
  console.log('   ⚠️ Default dist folder MISSING. Searching for alternatives...');
  // Try to find if it was built in the root or other common places
  const alternatives = [
    path.resolve(__dirname, '../../../frontend/dist'),
    path.resolve(__dirname, '../frontend/dist'),
    path.resolve(__dirname, '../../dist')
  ];
  
  for (const alt of alternatives) {
    if (fs.existsSync(alt)) {
      console.log('   ✅ Found alternative dist path:', alt);
      frontendDistPath = alt;
      break;
    }
  }
}

if (fs.existsSync(frontendDistPath)) {
  console.log('   ✅ Serving frontend from:', frontendDistPath);
  console.log('   📦 Contents:', fs.readdirSync(frontendDistPath).join(', '));
  app.use(express.static(frontendDistPath));
} else {
  console.log('   ❌ CRITICAL: No frontend dist folder found in any known location.');
  // List parent directories to help debug
  try {
     const rootPath = path.resolve(__dirname, '../..');
     console.log('   📂 Root Directory contents:', fs.readdirSync(rootPath).join(', '));
     if (fs.existsSync(path.join(rootPath, 'frontend'))) {
       console.log('   📂 Frontend Directory contents:', fs.readdirSync(path.join(rootPath, 'frontend')).join(', '));
     }
  } catch (e) {
     console.log('   Unable to list directories:', e.message);
  }
}

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
