import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  credits: {
    type: Number,
    default: 3,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  meetingLink: {
    type: String,
    default: '',
  },
  isMeetingLive: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Subject', subjectSchema);

