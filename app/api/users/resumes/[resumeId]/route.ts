import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

interface Resume {
  _id: mongoose.Types.ObjectId;
  name: string;
  blockIds: mongoose.Types.ObjectId[];
}

export async function GET(request: NextRequest) {
  try {
    // Extract resumeId from URL segments
    const segments = request.nextUrl.pathname.split('/');
    const resumeId = segments[segments.length - 2]; // Get the second-to-last segment

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const objectId = new mongoose.Types.ObjectId(resumeId);
    const user = await User.findOne({
      email: session.user.email,
      'resumes._id': objectId,
    });

    if (!user) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const resume = user.resumes.find((r: Resume) => r._id.toString() === resumeId);
    return NextResponse.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error('Error in GET /api/users/resumes/[resumeId]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract resumeId from URL segments
    const segments = request.nextUrl.pathname.split('/');
    const resumeId = segments[segments.length - 1];

    console.log('Received PUT request:', { 
      resumeId,
      pathname: request.nextUrl.pathname,
      segments 
    });

    if (!resumeId) {
      return NextResponse.json({ 
        error: 'Resume ID is required',
        details: { pathname: request.nextUrl.pathname } 
      }, { status: 400 });
    }

    // Validate resumeId format
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return NextResponse.json({ 
        error: 'Invalid resume ID format',
        details: { resumeId, isValid: mongoose.Types.ObjectId.isValid(resumeId) }
      }, { status: 400 });
    }

    const { name, blockIds } = await request.json();

    if (!name || !Array.isArray(blockIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    await dbConnect();

    // Create ObjectId once and reuse it
    const objectId = new mongoose.Types.ObjectId(resumeId);

    // Update the specific resume in the user's resumes array
    const result = await User.findOneAndUpdate(
      { 
        email: session.user.email,
        'resumes._id': objectId
      },
      { 
        $set: {
          'resumes.$.name': name,
          'resumes.$.blockIds': blockIds.map(id => 
            typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
          )
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Find the updated resume
    const updatedResume = result.resumes.find(
      (resume: Resume) => resume._id.toString() === resumeId
    );

    return NextResponse.json({ resume: updatedResume });
  } catch (error) {
    console.error('Error in PUT /api/users/resumes/[resumeId]:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
