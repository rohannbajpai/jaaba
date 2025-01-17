import mongoose from 'mongoose';
import { Schema } from 'mongoose';

/** Block interface for user's saved blocks */
export interface Block {
  _id: string;
  sectionName: string;
  title: string;
  location?: string;
  duration?: string;
  order: number;

  /* Header-specific */
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;

  /* Education-specific */
  degree?: string;
  relevantCourses?: string;
  activities?: string;

  /* Skills-specific */
  languages?: string;
  other?: string;

  /* Experience-specific */
  bullets?: string[];
  role?: string;

  /* Projects-specific */
  projectName?: string;
  technologies?: string;
  projectBullets?: string[];
}

/** Resume interface for user's saved resumes */
export interface Resume {
  name: string;
  blockIds: mongoose.Types.ObjectId[];
}

/** User document interface */
export interface UserDocument extends Document {
  email: string;
  blocks: Block[];
  resumes: Resume[];
}

/** Block Schema */
const BlockSchema = new Schema<Block>({
  sectionName: {
    type: String,
    required: true,
    enum: ['Header', 'Education', 'Experience', 'Projects', 'Technical Skills'],
  },
  title: { type: String, default: '' },
  location: { type: String },
  duration: { type: String },
  order: { type: Number, required: true },

  // Header-specific
  phone: { type: String },
  email: { type: String },
  github: { type: String },
  linkedin: { type: String },

  // Education-specific
  degree: { type: String },
  relevantCourses: { type: String },
  activities: { type: String },

  // Skills-specific
  languages: { type: String },
  other: { type: String },

  // Experience-specific
  bullets: { type: [String], default: [] },
  role: { type: String },

  // Projects-specific
  projectName: { type: String },
  technologies: { type: String },
  projectBullets: { type: [String], default: [] },
});

/** Resume Schema */
const ResumeSchema = new Schema<Resume>({
  name: { type: String, required: true },
  blockIds: [{ type: Schema.Types.ObjectId, ref: 'Block' }],
});

/** User Schema */
const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  blocks: [BlockSchema],
  resumes: [ResumeSchema],
}, {
  timestamps: true,
});

// Create indexes for better query performance
UserSchema.index({ email: 1 });

// Export the User model
export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema); 