import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['PDF', 'PPT', 'TEXT', 'VIDEO'],
    required: true,
  },
  filePath: {
    type: String,
    required: function() { return this.storageType === 'LOCAL'; }
  },
  storageType: {
    type: String,
    enum: ['LOCAL', 'S3'],
    default: 'LOCAL',
  },
  s3Key: {
    type: String,
    required: function() { return this.storageType === 'S3'; }
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  isOfficial: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Material', materialSchema);

