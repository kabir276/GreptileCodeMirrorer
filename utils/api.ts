import axios from 'axios';




export interface Source {
  repository: string;
  remote: string;
  branch: string;
  filepath: string;
  linestart: number;
  lineend: number;
  summary: string;
}

export interface ExtractionResult {
  extractedFeature: {
      message: string;
      sources: Source;
  };
  compatibilityAnalysis: {
      message: string;
      sources: Source;
  };
  implementationSuggestions: {
      message: string;
      sources: Source;
  };
}
export async function submitRepositories(
    inspirationRepo: string,
    userRepo: string,
    inspirationBranch: string,
    userBranch: string
) {
    try {
        const response = await axios.post('/api/indexRepositories', {
            inspirationRepo,
            userRepo,
            inspirationBranch,
            userBranch,
        });

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


export async function extractFeature(
    sessionId: string,
    featureTitle: string,
    featureDescription: string
): Promise<ExtractionResult> {
    try {
        const response = await axios.post<ExtractionResult>('/api/extractFeature', {
            sessionId,
            featureTitle,
            featureDescription,
        });

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to extract feature');
    }
}

export async function sendChatMessage(sessionId: string, chatInput: string) {
    try {
        const response = await axios.post('/api/chat', {
            sessionId,
            chatInput
        });

        return response.data;
    } catch (error) {
        console.error('Error in chat submission:', error);
        throw error;
    }
}