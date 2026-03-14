import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
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
  examType: {
    type: String,
    enum: ['MID_SEM', 'END_SEM', 'QUIZ', 'ASSIGNMENT'],
    default: 'END_SEM',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
}, {
  timestamps: true,
});

questionPaperSchema.index({ subject: 1, year: 1, semester: 1 });

export default mongoose.model('QuestionPaper', questionPaperSchema);

