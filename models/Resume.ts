import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
  id: String,
  sectionName: String,
  title: String,
  location: String,
  duration: String,
  latexCode: String,
  order: Number,
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const ResumeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  blocks: [BlockSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema); 