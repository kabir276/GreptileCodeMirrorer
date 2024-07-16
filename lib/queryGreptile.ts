import axios from 'axios';
import 'dotenv/config';

const GREPTILE_API_BASE = 'https://api.greptile.com/v2';

interface GreptileQueryResponse {
    message: string;
    sources: Array<{
        repository: string;
        remote: string;
        branch: string;
        filepath: string;
        linestart: number;
        lineend: number;
        summary: string;
    }>;
}

interface QueryPayload {
    messages: Array<{
        id: string;
        content: string;
        role: string;
    }>;
    repositories: Array<{
        remote: string;
        repository: string;
        branch: string;
    }>;
    stream: boolean;
    genius: boolean;
}

export async function queryGreptile(repo: string, content: string, branch: string, chatHistory?: string[]): Promise<GreptileQueryResponse> {
    const queryEndpoint: string = `${GREPTILE_API_BASE}/query`;
    
    const messages = chatHistory 
        ? [
            ...chatHistory.map((message, index) => ({
                id: `history-${index}`,
                content: message,
                role: index % 2 === 0 ? 'user' : 'assistant'
            })),
            {
                id: `query-${Date.now()}`,
                content: content,
                role: "user"
            }
          ]
        : [
            {
                id: `query-${Date.now()}`,
                content: content,
                role: "user"
            }
          ];

    const queryPayload: QueryPayload = {
        messages,
        repositories: [
            {
                remote: "github",
                repository: repo,
                branch: branch
            }
        ],
        stream: true,
        genius: true
    };

    try {
        const response = await axios.post(queryEndpoint, queryPayload, {
            headers: {
                'Authorization': `Bearer ${process.env.GREPTILE_TOKEN}`,
                'X-GitHub-Token': process.env.GITHUB_TOKEN,
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        });

        return new Promise<GreptileQueryResponse>((resolve, reject) => {
            let fullMessage = '';
            let sources: GreptileQueryResponse['sources'] = [];

            response.data.on('data', (chunk: Buffer) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.type === 'message') {
                            fullMessage += parsed.message;
                        } else if (parsed.type === 'sources') {
                            sources = parsed.sources;
                        }
                    } catch (err) {
                        console.error('Error parsing stream chunk:', err);
                    }
                }
            });

            response.data.on('end', () => {
                resolve({ message: fullMessage, sources });
            });

            response.data.on('error', (err: Error) => {
                reject(new Error('Error in Greptile API stream: ' + err.message));
            });
        });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Greptile API error:', error.response?.status, error.response?.data);
            throw new Error(`Greptile API error: ${error.message}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('Unexpected error occurred while querying Greptile API');
        }
    }
}