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


    const { idealRepo, userRepo, idealBranch, userBranch } = session;
    const idealQuery = `"provide a relevent response for ${chatInput}" `;


    const relevantChatHistory = await queryPineconeForRelevantHistory(sessionId, chatInput, userRepo);
    const idealrelevantChatHistory = await queryPineconeForRelevantHistory(sessionId, chatInput, idealRepo);

    // const idealQuery = `Determine if the following prompt is related to the ideal codebase: "${chatInput}"`
    const idealResponse = await queryGreptile(idealRepo, idealQuery, idealBranch, idealrelevantChatHistory);
    const userQuery = `
    reply to this user's input "${chatInput}"
    using the info below if needed
    response from the Ideal codebase: ${idealResponse.message}
    `;
    // const userQuery = `response from the Ideal codebase: ${idealResponse.message}\n\n  reply to this now ${chatInput}`
    const userResponse = await queryGreptile(userRepo, userQuery, userBranch, relevantChatHistory);

    const updatedChatHistory = [...relevantChatHistory, chatInput, userResponse.message];

    await upsertToPinecone(sessionId, userResponse.message,userRepo);
    await upsertToPinecone(sessionId, idealResponse.message,idealRepo);

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