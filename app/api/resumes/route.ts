import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Resume from '@/models/Resume';
import { authOptions } from '../auth/options';

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
      return NextResponse.json({ resume: resume || { blocks: [] } });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ resume: { blocks: [] } });
    }
  } catch (error) {
    console.error('Error in GET /api/resumes:', error);
    return NextResponse.json({ resume: { blocks: [] } });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blocks } = await request.json();
    
    try {
      await dbConnect();
      const resume = await Resume.findOneAndUpdate(
        { username: session.user.email },
        { 
          username: session.user.email,
          blocks,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      return NextResponse.json({ resume });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return the blocks that were attempted to be saved
      return NextResponse.json({ resume: { blocks } });
    }
  } catch (error) {
    console.error('Error in POST /api/resumes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 