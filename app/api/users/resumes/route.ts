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

    const { name } = await request.json();

    await dbConnect();

    // Create a new resume with initial empty blocks
    const newResume = {
      name,
      blockIds: [],
    };

    const result = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $push: { 
          resumes: newResume
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!result) {
      return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
    }

    const savedResume = result.resumes[result.resumes.length - 1];

    return NextResponse.json({ 
      success: true, 
      resume: savedResume 
    });
  } catch (error) {
    console.error('Error in POST /api/users/resumes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 