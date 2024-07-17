import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import 'dotenv/config';
import { indexRepository } from '../../../lib/indexRepository';
import Session from '../../../models/session';
import { MongoError } from 'mongodb';
import { dbConnect } from '@/lib/mongodb';

interface IndexRepositoriesRequest {
  idealRepo: string;
  userRepo: string;
  idealBranch: string;
  userBranch: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: IndexRepositoriesRequest = await req.json();
    const { idealRepo, userRepo, idealBranch, userBranch } = body;

    await dbConnect();

    
    const existingSession = await Session.findOne({
      idealRepo,
      userRepo,
      idealBranch,
      userBranch,
    });

    if (existingSession) {
      return NextResponse.json({
        message: "Session already exists. Your repositories are ready to go.",
        sessionId: existingSession._id,
      });
    }

    const indexingPromises = [
      indexRepository(idealRepo, idealBranch),
      indexRepository(userRepo, userBranch),
    ];

    try {
      await Promise.all(indexingPromises);
    } catch (indexingError) {
      console.error('Error during repository indexing:', indexingError);
      return NextResponse.json({ error: 'Failed to index repositories' }, { status: 500 });
    }
    const session = new Session({
      idealRepo,
      userRepo,
      idealBranch,
      userBranch,
    });

    try {
      await session.save();
    } catch (saveError) {
      if (saveError instanceof MongoError && saveError.code === 11000) {
      
        const concurrentSession = await Session.findOne({
          idealRepo,
          userRepo,
          idealBranch,
          userBranch,
        });
        if (concurrentSession) {
          return NextResponse.json({
            message: "Session created concurrently. Your repositories are ready to go.",
            sessionId: concurrentSession._id,
          });
        }
      }
      throw saveError; 
    }

    return NextResponse.json({
      message: "Your repositories are ready to go",
      sessionId: session._id,
    });

  } catch (error) {
    console.error('Error in indexing repositories:', error);

    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;
      return NextResponse.json({ error: `API error: ${errorMessage}` }, { status: statusCode });
    }

    if (error instanceof MongoError) {
      console.error('MongoDB error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}