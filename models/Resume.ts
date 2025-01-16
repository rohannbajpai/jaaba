// models/Resume.ts
import mongoose, { Document, Schema } from 'mongoose';

/** Data interface for each résumé block. */
export interface EditableBlockData {
  id: string;
  sectionName: string;

  /* Common fields */
  title: string;
  location?: string;
  duration?: string;

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
  bullets?: string[]; // bullet points
  role?: string; // e.g., "Software Engineer Intern"

  /* Projects-specific */
  projectName?: string; // e.g., "Portfolio Website"
  technologies?: string;
  projectBullets?: string[];

  latexCode?: string;
  order?: BigInteger;
  updatedAt?: Date;
}

interface ResumeDocument extends Document {
  username: string;
  blocks: EditableBlockData[];
  updatedAt: Date;
}

/** Mongoose schema for each résumé block. */
const BlockSchema = new mongoose.Schema<EditableBlockData>({
  id: {
    type: String,
    required: true,
  },
  sectionName: {
    type: String,
    required: true,
    enum: [
      'Header',
      'Education',
      'Experience',
      'Projects',
      'Technical Skills',
    ], // Restricts section names to predefined values
  },

  /* Common fields */
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  duration: {
    type: String,
    required: false,
  },

  /* Header-specific fields */
  phone: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
    match: [
      /^\S+@\S+\.\S+$/,
      'Please provide a valid email address.',
    ], // Validates email format
  },
  github: {
    type: String,
    required: false,
    match: [
      /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+$/,
      'Please provide a valid GitHub URL.',
    ], // Validates GitHub URL format
  },
  linkedin: {
    type: String,
    required: false,
    match: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+$/,
      'Please provide a valid LinkedIn URL.',
    ], // Validates LinkedIn URL format
  },

  /* Education-specific fields */
  degree: {
    type: String,
    required: false,
  },
  relevantCourses: {
    type: String,
    required: false,
  },
  activities: {
    type: String,
    required: false,
  },

  /* Skills-specific fields */
  languages: {
    type: String,
    required: false,
  },
  other: {
    type: String,
    required: false,
  },

  /* Experience-specific fields */
  bullets: {
    type: [String],
    required: false,
    default: [], // Initializes as an empty array if not provided
  },
  role: {
    type: String,
    required: false,
  },

  /* Projects-specific fields */
  projectName: {
    type: String,
    required: false,
  },
  technologies: {
    type: String,
    required: false,
  },
  projectBullets: {
    type: [String],
    required: false,
    default: [], // Initializes as an empty array if not provided
  },

  /* Additional fields */
  latexCode: {
    type: String,
    required: false,
  },
  order: {
    type: Number,
    required: true,
    default: 0, // Default order if not specified
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/** Mongoose schema for the resume. */
const ResumeSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Removes whitespace from both ends
    },
    blocks: [BlockSchema], // Embeds multiple blocks within a resume
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Add a compound unique index on username and blocks.id
ResumeSchema.index({ username: 1, "blocks.id": 1 }, { unique: true });

// Export the Resume model, avoiding recompilation errors in watch mode
export default mongoose.models.Resume ||
  mongoose.model<ResumeDocument>('Resume', ResumeSchema);
