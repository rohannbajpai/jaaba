import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User, { Resume } from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Types } from 'mongoose';

/**
 * GET /api/users/resumes
 * Retrieves all resumes for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ resumes: [] });
    }

    return NextResponse.json({ resumes: user.resumes });
  } catch (error) {
    console.error('Error in GET /api/users/resumes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/users/resumes
 * Creates or updates a resume for the authenticated user
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, blockIds } = await request.json();
    if (!name || !Array.isArray(blockIds)) {
      return NextResponse.json({ error: 'Invalid resume data' }, { status: 400 });
    }

    await dbConnect();

    // Find or create user
    let user = await User.findOne({ email: session.user.email });
    if (!user) {
      user = new User({
        email: session.user.email,
        blocks: [],
        resumes: [],
      });
    }

    // Find the blocks in user's blocks array that match the blockIds
    const validBlocks = user.blocks.filter(block => 
      blockIds.some(id => id === block._id.toString())
    );
    const validBlockIds = validBlocks.map(block => block._id);

    // Create or update resume with valid block IDs
    const resumeIndex = user.resumes.findIndex(r => r.name === name);
    const resume = {
      name,
      blockIds: validBlockIds,
    };

    if (resumeIndex === -1) {
      user.resumes.push(resume);
    } else {
      user.resumes[resumeIndex] = resume;
    }

    await user.save();

    return NextResponse.json({ success: true, resume });
  } catch (error) {
    console.error('Error in POST /api/users/resumes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 