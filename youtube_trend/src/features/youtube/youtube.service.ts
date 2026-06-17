import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';
import { config } from '../../config/env.config';
import { YouTubeVideo } from './youtube.types';

const client = new ApifyClient({
    token: config.apifyApiKey,
});

export class YouTubeService {
    private static ACTOR_ID = 'streamers/youtube-scraper';

    static async getTrendingVideos(limit: number = 5): Promise<YouTubeVideo[]> {
        console.log(`Starting scrap for top ${limit} trending videos...`);

        // Prepare the input for the actor
        const input = {
            "searchQueries": ["trending videos", "most viewed videos 2024"],
            "maxResults": limit,
            "maxVideosPerPage": limit,
            "uploadDate": "today", 
            "sort": "viewCount",
            "proxyConfiguration": {
                "useApifyProxy": true,
                "apifyProxyGroups": ["RESIDENTIAL"]
            }
        };

        try {
            // Run the actor and wait for it to finish
            const run = await client.actor(this.ACTOR_ID).call(input);

            // Fetch results from the run's dataset
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            console.log(`Apify completed. Items found: ${items.length}`);

            if (items.length === 0) {
                return [];
            }

            // Transform data with defensive checks
            const mappedItems = items.map((item: any) => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                title: item.title || 'Untitled Video',
                url: item.url || '#',
                thumbnailUrl: item.thumbnailUrl || '',
                viewCount: typeof item.viewCount === 'number' ? item.viewCount : 0,
                date: item.date || 'Unknown date',
                likes: typeof item.likes === 'number' ? item.likes : 0,
                channelName: item.channelName || 'Unknown Channel',
                channelUrl: item.channelUrl || '#',
                duration: item.duration || '0:00',
                description: (item.text || item.description || '').substring(0, 200) + '...'
            }));

            // Save results to a local JSON file
            this.saveResultsToJson(mappedItems);

            return mappedItems;
        } catch (error) {
            console.error('Error during Apify scraping:', error);
            throw new Error('Failed to fetch data from Apify');
        }
    }

    private static saveResultsToJson(videos: YouTubeVideo[]) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `results_${timestamp}.json`;
            const dirPath = path.join(process.cwd(), 'scrapes');
            const filePath = path.join(dirPath, filename);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(filePath, JSON.stringify(videos, null, 2));
            console.log(`Results saved to ${filePath}`);
        } catch (error) {
            console.error('Failed to save JSON file:', error);
        }
    }
}
