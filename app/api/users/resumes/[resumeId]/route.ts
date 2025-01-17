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
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/');
    const resumeId = segments[4];

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

export async function PUT(
  request: Request,
  { params }: { params: { resumeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, blockIds } = await request.json();
    const resumeId = params.resumeId;

    if (!resumeId || !name || !Array.isArray(blockIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    await dbConnect();

    // Update the specific resume in the user's resumes array
    const result = await User.findOneAndUpdate(
      { 
        email: session.user.email,
        'resumes._id': new mongoose.Types.ObjectId(resumeId)
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
      resume => resume._id.toString() === resumeId
    );

    return NextResponse.json({ resume: updatedResume });
  } catch (error) {
    console.error('Error in PUT /api/users/resumes/[resumeId]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
