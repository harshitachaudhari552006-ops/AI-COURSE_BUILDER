import mongoose from 'mongoose';

const aiQuestionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  },
  topic: {
    type: String,
    trim: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
  },
  type: {
    type: String,
    enum: ['MCQ', 'SHORT_ANSWER', 'LONG_ANSWER', 'NUMERICAL'],
    default: 'SHORT_ANSWER',
  },
  marks: {
    type: Number,
    default: 5,
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'MEDIUM',
  },
  isPredicted: {
    type: Boolean,
    default: true,
  },
  aiProvider: {
    type: String,
    enum: ['OPENAI', 'GEMINI', 'RESCUE'],
    default: 'GEMINI',
  },
}, {
  timestamps: true,
});

aiQuestionSchema.index({ subject: 1, module: 1, topic: 1 });

export default mongoose.model('AIQuestion', aiQuestionSchema);

