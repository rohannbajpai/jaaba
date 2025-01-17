import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { blockId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { updates } = await request.json();
    const blockId = await params.blockId;

    await dbConnect();

    // Fix: Preserve existing block data and only update changed fields
    const result = await User.findOneAndUpdate(
      {
        email: session.user.email,
        'blocks._id': new mongoose.Types.ObjectId(blockId)
      },
      {
        $set: {
          'blocks.$': {
            ...updates,
            _id: new mongoose.Types.ObjectId(blockId),
            id: updates.id,
            sectionName: updates.sectionName || updates.sectionName,
            order: updates.order || 0,
            // Add section-specific fields based on sectionName
            ...(updates.sectionName?.toLowerCase() === 'header' && {
              fullName: updates.fullName,
              phone: updates.phone,
              email: updates.email,
              github: updates.github,
              linkedin: updates.linkedin
            }),
            ...(updates.sectionName?.toLowerCase() === 'education' && {
              institutionName: updates.institutionName,
              location: updates.location,
              duration: updates.duration,
              degree: updates.degree,
              relevantCourses: updates.relevantCourses,
              activities: updates.activities
            }),
            ...(updates.sectionName?.toLowerCase() === 'experience' && {
              companyName: updates.companyName,
              location: updates.location,
              duration: updates.duration,
              role: updates.role,
              bullets: updates.bullets || []
            }),
            ...(updates.sectionName?.toLowerCase() === 'projects' && {
              projectName: updates.projectName,
              technologies: updates.technologies,
              duration: updates.duration,
              location: updates.location,
              projectBullets: updates.projectBullets || []
            }),
            ...(updates.sectionName?.toLowerCase() === 'technical skills' && {
              languages: updates.languages,
              other: updates.other
            })
          }
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Find the updated block
    const updatedBlock = result.blocks.find(
      (block: { _id: mongoose.Types.ObjectId }) => block._id.toString() === blockId
    );

    return NextResponse.json({ block: updatedBlock });
  } catch (error) {
    console.error('Error in PATCH /api/users/blocks/[blockId]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 