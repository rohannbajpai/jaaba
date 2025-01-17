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

    // Create new block with MongoDB ID
    const newBlock = {
      ...block,
      _id: new mongoose.Types.ObjectId()
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