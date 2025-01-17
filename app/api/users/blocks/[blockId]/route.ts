import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract blockId from URL segments
    const segments = request.nextUrl.pathname.split('/');
    const blockId = segments[segments.length - 1];

    console.log('Received PATCH request:', { 
      blockId,
      pathname: request.nextUrl.pathname,
      segments 
    });

    if (!blockId) {
      return NextResponse.json({ 
        error: 'Block ID is required',
        details: { pathname: request.nextUrl.pathname } 
      }, { status: 400 });
    }

    // Validate blockId format
    if (!mongoose.Types.ObjectId.isValid(blockId)) {
      return NextResponse.json({ 
        error: 'Invalid block ID format',
        details: { blockId, isValid: mongoose.Types.ObjectId.isValid(blockId) }
      }, { status: 400 });
    }

    const { updates } = await request.json();
    await dbConnect();

    // Use the validated blockId
    const objectId = new mongoose.Types.ObjectId(blockId);

    // Create base update object with common fields
    const baseUpdate = {
      id: updates.id,
      sectionName: updates.sectionName,
      order: updates.order ?? 0,
      location: updates.location,
      duration: updates.duration,
    };

    // Add section-specific fields
    const sectionSpecificFields = (() => {
      switch (updates.sectionName?.toLowerCase()) {
        case 'header':
          return {
            fullName: updates.fullName,
            phone: updates.phone,
            email: updates.email,
            github: updates.github,
            linkedin: updates.linkedin,
          };
        case 'education':
          return {
            institutionName: updates.institutionName,
            degree: updates.degree,
            relevantCourses: updates.relevantCourses,
            activities: updates.activities,
          };
        case 'experience':
          return {
            companyName: updates.companyName,
            role: updates.role,
            bullets: updates.bullets || [],
          };
        case 'projects':
          return {
            projectName: updates.projectName,
            technologies: updates.technologies,
            projectBullets: updates.projectBullets || [],
          };
        case 'technical skills':
          return {
            languages: updates.languages,
            other: updates.other,
          };
        default:
          return {};
      }
    })();

    const result = await User.findOneAndUpdate(
      {
        email: session.user.email,
        'blocks._id': objectId
      },
      {
        $set: {
          'blocks.$': {
            _id: objectId,
            ...baseUpdate,
            ...sectionSpecificFields,
          }
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const updatedBlock = result.blocks.find(
      (block: { _id: mongoose.Types.ObjectId }) => block._id.toString() === blockId
    );

    return NextResponse.json({ block: updatedBlock });
  } catch (error) {
    console.error('Error in PATCH /api/users/blocks/[blockId]:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 