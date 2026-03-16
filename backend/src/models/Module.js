import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
  }],
  topics: [{
    type: String,
    trim: true,
  }],
  youtubeUrls: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Compound index to ensure unique module number per subject
moduleSchema.index({ subject: 1, number: 1 }, { unique: true });

export default mongoose.model('Module', moduleSchema);

