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
// Security middleware with CSP configuration for YouTube
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "frame-src": ["'self'", "https://www.youtube.com", "https://youtube.com"],
      "img-src": ["'self'", "data:", "https://i.ytimg.com", "https://s.ytimg.com", "https://*.amazonaws.com"],
      "script-src": ["'self'", "'unsafe-inline'", "https://www.youtube.com", "https://s.ytimg.com"],
    },
  },
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased limit to prevent 429 errors during development
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
  
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  // ⚠️ Graceful Fallback for missing build
  res.status(200).send(`
    <html>
      <head><title>Setup in Progress</title></head>
      <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f4f4f9; color: #333; text-align: center; padding: 20px;">
        <h1 style="color: #4a90e2;">🚀 Backend is Ready!</h1>
        <p style="font-size: 1.1rem; max-width: 600px;">The server is live, but your <b>Frontend Login Screen</b> is still being built or was blocked by a setup error.</p>
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px;">
          <h3 style="margin-top: 0;">How to fix this on Render:</h3>
          <ul style="text-align: left; line-height: 1.6;">
            <li>Go to <b>Manual Deploy</b> -> <b>Clear Build Cache & Deploy</b>.</li>
            <li>Ensure your Build Command is: <code>npm run build</code></li>
            <li>Verify you have added <code>MONGODB_URI</code> in environment variables.</li>
          </ul>
        </div>
        <p style="margin-top: 20px; color: #777;">Refreshing this page in 2-3 minutes usually solves it.</p>
      </body>
    </html>
  `);
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
