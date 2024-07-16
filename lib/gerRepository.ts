import axios from 'axios';
import { waitForIndexing } from './waitForIndexing';
import 'dotenv/config';



export async function indexRepository(repo: string, branch: string): Promise<void> {
    const repositoryIdentifier = encodeURIComponent(`github:${branch}:${repo}`);

    const GREPTILE_API_BASE = `https://api.greptile.com/v2`;
    const indexEndpoint = `${GREPTILE_API_BASE}/repositories/${repositoryIdentifier}`;

    await axios.get(indexEndpoint, {
        headers: {
            'Authorization': `Bearer ${process.env.GREPTILE_TOKEN}`,
            'X-GitHub-Token': process.env.GITHUB_TOKEN,
        },
    });

    await waitForIndexing(repo);
}