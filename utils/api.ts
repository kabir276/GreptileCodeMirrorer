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
        const response = await fetch('/api/indexRepositories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inspirationRepo,
                userRepo,
                inspirationBranch,
                userBranch,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
export interface Source {
    repository: string;
    remote: string;
    branch: string;
    filepath: string;
    linestart: number;
    lineend: number;
    summary: string;
  }

export async function extractFeature(
    sessionId: string,
    featureTitle: string,
    featureDescription: string
): Promise<ExtractionResult> {
    const response = await fetch('/api/extractFeature', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sessionId,
            featureTitle,
            featureDescription,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to extract feature');
    }

    return await response.json();
}

export async function sendChatMessage(sessionId: string, chatInput: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        chatInput
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send chat message');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in chat submission:', error);
    throw error;
  }
}