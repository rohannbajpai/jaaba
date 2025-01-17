import mongoose from 'mongoose';
import { Schema } from 'mongoose';

/** Block interface for user's saved blocks */
export interface Block {
  _id?: string;
  id: string;    // Client-side ID
  sectionName: string;
  order: number;

  // Header-specific
  fullName?: string;
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;

  // Education-specific
  institutionName?: string;
  location?: string;
  duration?: string;
  degree?: string;
  relevantCourses?: string;
  activities?: string;

  // Experience-specific
  companyName?: string;
  role?: string;
  bullets?: string[];

  // Projects-specific
  projectName?: string;
  technologies?: string;
  projectBullets?: string[];

  // Skills-specific
  languages?: string;
  other?: string;
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
  _id: { type: Schema.Types.ObjectId, auto: true },
  id: { type: String, required: true }, // Client-side ID
  sectionName: {
    type: String,
    required: true,
    enum: ['Header', 'Education', 'Experience', 'Projects', 'Technical Skills'],
  },
  order: { type: Number, required: true, default: 0 },

  // Header-specific
  fullName: { type: String },
  phone: { type: String },
  email: { type: String },
  github: { type: String },
  linkedin: { type: String },

  // Education-specific
  institutionName: { type: String },
  location: { type: String },
  duration: { type: String },
  degree: { type: String },
  relevantCourses: { type: String },
  activities: { type: String },

  // Experience-specific
  companyName: { type: String },
  role: { type: String },
  bullets: [{ type: String }],

  // Projects-specific
  projectName: { type: String },
  technologies: { type: String },
  projectBullets: [{ type: String }],

  // Skills-specific
  languages: { type: String },
  other: { type: String }
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

// Only define index once
UserSchema.index({ email: 1 });

// Export the User model
export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema); 