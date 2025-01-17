import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from "@/lib/auth";

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

    let user = await User.findOne({ email: session.user.email });
    if (!user) {
      user = new User({
        email: session.user.email,
        blocks: [],
        resumes: [],
      });
    }

    const resume = {
      name,
      blockIds: blockIds,
    };

    user.resumes.push(resume);
    await user.save();

    const savedResume = user.resumes[user.resumes.length - 1];

    return NextResponse.json({ 
      success: true, 
      resume: savedResume 
    });
  } catch (error) {
    console.error('Error in POST /api/users/resumes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 