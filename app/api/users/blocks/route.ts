import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from "@/lib/auth";
import mongoose from 'mongoose';

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

    const { block } = await request.json();

    await dbConnect();

    // Create new block with MongoDB ID
    const newBlock = {
      ...block,
      _id: new mongoose.Types.ObjectId()
    };

    // Add block to user's universal blocks array, ensuring no duplicates
    const result = await User.findOneAndUpdate(
      { 
        email: session.user.email,
        'blocks.id': { $ne: block.id } // Prevent duplicates based on client-side ID
      },
      { $push: { blocks: newBlock } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: 'Failed to save block' }, { status: 500 });
    }

    // Get the newly created block
    const savedBlock = result.blocks[result.blocks.length - 1];

    return NextResponse.json({ block: savedBlock });
  } catch (error) {
    console.error('Error in POST /api/users/blocks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Add a DELETE endpoint to remove blocks
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blockId } = await request.json();

    await dbConnect();

    // Remove block from user's universal blocks array
    const result = await User.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { blocks: { _id: new mongoose.Types.ObjectId(blockId) } } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/users/blocks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 