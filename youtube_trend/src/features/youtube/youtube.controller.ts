import { Request, Response } from 'express';
import { YouTubeService } from './youtube.service';

export class YouTubeController {
    static async getTrends(req: Request, res: Response) {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[${requestId}] GET /api/trends - Limit: ${req.query.limit || 5}`);
        
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            const videos = await YouTubeService.getTrendingVideos(limit);
            
            console.log(`[${requestId}] Success - Returned ${videos.length} videos`);
            
            res.status(200).json({
                success: true,
                count: videos.length,
                data: videos
            });
        } catch (error: any) {
            console.error(`[${requestId}] Error:`, error.message);
            res.status(500).json({
                success: false,
                message: 'Scraper Error: ' + (error.message || 'Unknown error occurred'),
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
}
