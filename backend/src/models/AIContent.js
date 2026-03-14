import mongoose from 'mongoose';

const aiContentSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  topic: {
    type: String,
    trim: true,
  },
  extraNotes: {
    type: String,
  },
  numericals: [{
    question: String,
    solution: String,
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
  }],
  examPoints: [{
    type: String,
  }],
  youtubeLinks: [{
    title: String,
    url: String,
    description: String,
  }],
  aiProvider: {
    type: String,
    enum: ['OPENAI', 'GEMINI', 'RESCUE'],
    default: 'GEMINI',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

aiContentSchema.index({ module: 1, topic: 1 });

export default mongoose.model('AIContent', aiContentSchema);

