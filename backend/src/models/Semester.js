import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  syllabusType: {
    type: String,
    enum: ['2019-C', 'NEP 2020'],
    required: true,
    default: 'NEP 2020',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique semester number per syllabus type
semesterSchema.index({ number: 1, syllabusType: 1 }, { unique: true });

export default mongoose.model('Semester', semesterSchema);

