import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { block, resumeId } = await request.json();

    await dbConnect();

    // Create new block with MongoDB ID and all fields
    const newBlock = {
      _id: new mongoose.Types.ObjectId(),
      id: block.id,
      sectionName: block.sectionName,
      order: block.order || 0,
      // Add section-specific fields based on sectionName
      ...(block.sectionName.toLowerCase() === 'header' && {
        fullName: block.fullName,
        phone: block.phone,
        email: block.email,
        github: block.github,
        linkedin: block.linkedin
      }),
      ...(block.sectionName.toLowerCase() === 'education' && {
        institutionName: block.institutionName,
        location: block.location,
        duration: block.duration,
        degree: block.degree,
        relevantCourses: block.relevantCourses,
        activities: block.activities
      }),
      ...(block.sectionName.toLowerCase() === 'experience' && {
        companyName: block.companyName,
        location: block.location,
        duration: block.duration,
        role: block.role,
        bullets: block.bullets || []
      }),
      ...(block.sectionName.toLowerCase() === 'projects' && {
        projectName: block.projectName,
        technologies: block.technologies,
        duration: block.duration,
        location: block.location,
        projectBullets: block.projectBullets || []
      }),
      ...(block.sectionName.toLowerCase() === 'technical skills' && {
        languages: block.languages,
        other: block.other
      })
    };

    // Add block and update resume in one operation
    const result = await User.findOneAndUpdate(
      { 
        email: session.user.email,
        'resumes._id': new mongoose.Types.ObjectId(resumeId),
        'blocks.id': { $ne: block.id } // Prevent duplicates
      },
      { 
        $push: { 
          blocks: newBlock,
          'resumes.$.blockIds': newBlock._id
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      return NextResponse.json({ error: 'Failed to save block' }, { status: 500 });
    }

    // Get the newly created block
    const savedBlock = result.blocks[result.blocks.length - 1];

    return NextResponse.json({ block: savedBlock });
  } catch (error) {
    console.error('Error in POST /api/users/blocks/add-to-resume:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 