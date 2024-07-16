import { NextRequest, NextResponse } from 'next/server';
import { queryGreptile } from '../../../lib/queryGreptile';
import { dbConnect } from '../../../lib/mongodb';
import Session from '../../../models/session';
import { queryPineconeForRelevantHistory, upsertToPinecone } from '../../../lib/pineconecalls';
import { MongoError } from 'mongodb';

interface ChatRequest {
  sessionId: string;
  chatInput: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { sessionId, chatInput } = body;

    if (!sessionId || !chatInput) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const session = await Session.findById(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }


    const { inspirationRepo, userRepo, inspirationBranch, userBranch } = session;
    const idealQuery = `
Regarding the codebase ${inspirationRepo}:

"${chatInput}"

Provide a relevant response based on this codebase.`;


    const relevantChatHistory = await queryPineconeForRelevantHistory(sessionId, chatInput, userRepo);
    const idealrelevantChatHistory = await queryPineconeForRelevantHistory(sessionId, chatInput, inspirationRepo);

    // const idealQuery = `Determine if the following prompt is related to the ideal codebase: "${chatInput}"`
    const idealResponse = await queryGreptile(inspirationRepo, idealQuery, inspirationBranch, idealrelevantChatHistory);
    const userQuery = `
    Considering the codebase ${userRepo} and the following information:
    
    ${idealResponse.message}
    
    "${chatInput}"
    
    Provide a final response that is relevant to this codebase and the user's input.`;
    // const userQuery = `response from the Ideal codebase: ${idealResponse.message}\n\n  reply to this now ${chatInput}`
    const userResponse = await queryGreptile(userRepo, userQuery, userBranch, relevantChatHistory);

    const updatedChatHistory = [...relevantChatHistory, chatInput, userResponse.message];

    await upsertToPinecone(sessionId, userResponse.message,userRepo);
    await upsertToPinecone(sessionId, idealResponse.message,inspirationRepo);

    return NextResponse.json({
      message: userResponse.message,
      chatHistory: updatedChatHistory
    });

  } catch (error) {
    console.error('Error in chat processing:', error);

    if (error instanceof MongoError) {
      console.error('MongoDB error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}