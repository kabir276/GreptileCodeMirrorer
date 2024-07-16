import axios from "axios";
import 'dotenv/config';

import { waitForIndexing } from "./waitForIndexing";

export async function indexRepository(repo: string, branch: string): Promise<void> {
    const GREPTILE_API_BASE = `https://api.greptile.com/v2`;
    const indexEndpoint = `${GREPTILE_API_BASE}/repositories`;

    try {
        const response = await axios.post(indexEndpoint, {
            remote: 'github',
            repository: repo,
            branch: branch,
            reload: true,
            notify: true,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GREPTILE_TOKEN}`,
                'X-GitHub-Token': process.env.GITHUB_TOKEN,
            },
        });

        console.log(`Indexing initiated for ${repo}. Response:`, response.data);
        if(response.data={ response: 'repo already exists' }){
            return 
        }
        return await waitForIndexing(repo);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error indexing repository ${repo}:`, error.response?.data || error.message);
        } else {
            console.error(`Unexpected error indexing repository ${repo}:`, error);
        }
        throw error; 
    }
}