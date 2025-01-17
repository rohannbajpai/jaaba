import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/users/blocks
 * Retrieves all blocks for the authenticated user
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
      return NextResponse.json({ blocks: [] });
    }

    return NextResponse.json({ blocks: user.blocks });
  } catch (error) {
    console.error('Error in GET /api/users/blocks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/blocks
 * Updates blocks for the authenticated user
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blocks } = await request.json();
    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Invalid blocks data' }, { status: 400 });
    }

    await dbConnect();

    // Use findOneAndUpdate instead of save()
    const result = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { blocks },
        $setOnInsert: { 
          email: session.user.email,
          resumes: []
        }
      },
      { 
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        runValidators: true // Run model validations
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update blocks' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      blocks: result.blocks 
    });

  } catch (error) {
    console.error('Error in POST /api/users/blocks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 