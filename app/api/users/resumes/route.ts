import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
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

    if (!name) {
      return NextResponse.json({ error: 'Resume name is required' }, { status: 400 });
    }

    await dbConnect();

    // First, ensure the user exists or create them
    let user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        email: session.user.email,
        blocks: [],
        resumes: []
      });
    }

    // Create new resume with MongoDB ID
    const newResume = {
      _id: new mongoose.Types.ObjectId(),
      name,
      blockIds: [] // Start with empty blocks array
    };

    // Add resume to user's resumes array
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
      return NextResponse.json(
        { 
          error: 'Failed to create resume',
          details: 'User not found or database error'
        }, 
        { status: 500 }
      );
    }

    // Get the newly created resume
    const savedResume = result.resumes[result.resumes.length - 1];

    return NextResponse.json({ 
      success: true, 
      resume: savedResume 
    });
  } catch (error) {
    console.error('Error in POST /api/users/resumes:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 