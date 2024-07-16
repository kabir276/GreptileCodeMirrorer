import axios from 'axios';
import 'dotenv/config';

const GREPTILE_API_BASE = 'https://api.greptile.com/v2';
const MAX_POLLING_ATTEMPTS = 30;
const POLLING_INTERVAL = 10000;

interface GreptileRepoStatusResponse {
    repository: string;
    remote: string;
    branch: string;
    private: boolean;
    status: string;
    filesProcessed: number;
    numFiles: number;
    sampleQuestions: string[];
    sha: string;
}

export async function waitForIndexing(repo: string): Promise<void> {
    const encodedRepo = encodeURIComponent(`github:main:${repo}`);
    const statusEndpoint = `${GREPTILE_API_BASE}/repositories/${encodedRepo}`;

    for (let i = 0; i < MAX_POLLING_ATTEMPTS; i++) {
        try {
            const response = await axios.get<GreptileRepoStatusResponse>(statusEndpoint, {
                headers: {
                    'Authorization': `Bearer ${process.env.GREPTILE_TOKEN}`,
                    'X-GitHub-Token': process.env.GITHUB_TOKEN,
                },
            });

            if (response.data.status === 'completed') {
                console.log(`Indexing completed for ${repo}`);
                return;
            }

            console.log(`Indexing in progress for ${repo}. Status: ${response.data.status}. Files processed: ${response.data.filesProcessed}/${response.data.numFiles}. Attempt ${i + 1}/${MAX_POLLING_ATTEMPTS}`);
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log(`Repository ${repo} not found or indexing not started. Attempt ${i + 1}/${MAX_POLLING_ATTEMPTS}`);
                await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
            } else {
                throw error;
            }
        }
    }

    throw new Error(`Indexing timed out for ${repo}`);
}