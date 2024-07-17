import { embedText } from './embeding';
import { pinecone, INDEX_NAME } from './pinecone';

let messageCounter = 0;

export async function upsertToPinecone(sessionId: string, message: string, repo: string): Promise<void> {
  try {
    const embedding = await embedText(message);
    const index = pinecone.Index(INDEX_NAME);
    
    await index.upsert([
      {
        id: `${sessionId}-${repo}-${messageCounter++}`,
        values: embedding,
        metadata: { sessionId, repo,message }
      }
    ]);
  } catch (error) {
    console.error('Error in upsertToPinecone:', error);
    throw error;
  }
}

export async function queryPineconeForRelevantHistory(
  sessionId: string, 
  currentQuery: string, 
  repo: string,
  topK = 10
): Promise<string[]> {
  try {
    const queryEmbedding = await embedText(currentQuery);
    const index = pinecone.Index(INDEX_NAME);
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      filter: { sessionId, repo },
      includeMetadata: true,
    });

    return queryResponse.matches
      .filter((match): match is typeof match & { metadata: { message: string } } =>
        match.metadata !== undefined &&
        typeof match.metadata === 'object' &&
        'message' in match.metadata &&
        typeof match.metadata.message === 'string'
      )
      .map(match => match.metadata.message);
  } catch (error) {
    console.error('Error in queryPineconeForRelevantHistory:', error);
    throw error;
  }
}