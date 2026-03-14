import express from 'express';
import Material from '../models/Material.js';
import Module from '../models/Module.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import { listS3Objects, getS3SignedUrl, getS3ObjectStream } from '../services/s3Service.js';

const router = express.Router();

// Get materials by module
router.get('/module/:moduleId', authenticate, async (req, res) => {
  try {
    const materials = await Material.find({ module: req.params.moduleId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get objects from S3 bucket
router.get('/s3/list', authenticate, async (req, res) => {
  try {
    const objects = await listS3Objects();
    res.json(objects);
  } catch (error) {
    console.error('Error listing S3 objects:', error);
    res.status(500).json({ message: 'Error fetching S3 objects' });
  }
});

// Link an S3 object to a module
router.post('/s3/link', authenticate, async (req, res) => {
  try {
    const { moduleId, title, description, type, s3Key, fileSize } = req.body;

    if (!moduleId || !title || !type || !s3Key) {
      return res.status(400).json({ message: 'Module ID, title, type, and S3 Key are required' });
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const material = new Material({
      title,
      type: type.toUpperCase(),
      storageType: 'S3',
      s3Key,
      fileName: s3Key.split('/').pop(),
      fileSize: fileSize || 0,
      module: moduleId,
      uploadedBy: req.student ? req.student._id : req.user._id, // Support both student and user if applicable
      description: description || '',
      isOfficial: true,
    });

    await material.save();
    module.materials.push(material._id);
    await module.save();

    res.status(201).json(material);
  } catch (error) {
    console.error('Error linking S3 material:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download material file
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.storageType === 'S3') {
      const response = await getS3ObjectStream(material.s3Key);
      res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
      return response.Body.pipe(res);
    }

    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', 'materials', material.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, material.fileName);
  } catch (error) {
    console.error('Error downloading material:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload material (for teachers - would need teacher auth in production)
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { moduleId, title, description, type } = req.body;

    if (!moduleId || !title || !type) {
      return res.status(400).json({ message: 'Module ID, title, and type are required' });
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const material = new Material({
      title,
      type: type.toUpperCase(),
      filePath: req.file.filename,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      module: moduleId,
      uploadedBy: req.student._id, // In production, use teacher ID
      description: description || '',
      isOfficial: true,
    });

    await material.save();

    // Add material to module
    module.materials.push(material._id);
    await module.save();

    res.status(201).json(material);
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

