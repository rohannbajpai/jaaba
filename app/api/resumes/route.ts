// pages/api/resumes.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Resume from '@/models/Resume';
import { authOptions } from '../auth/options';

/**
 * Handles GET requests to fetch the user's resume.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await dbConnect();
      console.log('Connected to MongoDB successfully');
      
      const resume = await Resume.findOne({ username: session.user.email });
      
      // Ensure blocks is always an array
      const blocks = resume?.blocks ?? [];

      // Convert Mongoose document to plain object and ensure blocks is an array
      const resumeData = resume ? { ...resume.toObject(), blocks } : { blocks: [] };

      return NextResponse.json({ resume: resumeData });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ resume: { blocks: [] } }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/resumes:', error);
    return NextResponse.json({ resume: { blocks: [] } }, { status: 500 });
  }
}

/**
 * Handles POST requests to create or update the user's resume.
 * Expects a JSON body with a `blocks` array.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the JSON body and destructure 'blocks'
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON format.' }, { status: 400 });
    }

    const { blocks } = requestData;

    // Sanitize 'blocks' to ensure it's an array
    const sanitizedBlocks = Array.isArray(blocks) ? blocks : [];

    // Ensure each block has a unique and non-null 'id'
    const blockIds = sanitizedBlocks.map(block => block.id);
    const uniqueBlockIds = new Set(blockIds);

    if (blockIds.length !== uniqueBlockIds.size || blockIds.includes(null) || blockIds.includes(undefined)) {
      return NextResponse.json({ error: 'Each block must have a unique and non-null `id`.' }, { status: 400 });
    }

    try {
      await dbConnect();
      
      const resume = await Resume.findOneAndUpdate(
        { username: session.user.email },
        { 
          username: session.user.email,
          blocks: sanitizedBlocks,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      
      if (!resume) {
        // This case is unlikely due to upsert, but handle it just in case
        return NextResponse.json({ error: 'Failed to create or update resume.' }, { status: 500 });
      }
      
      return NextResponse.json({ resume });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save resume data.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/resumes:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
