import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { NewsService } from './features/news/services/news.service.js';
import { config } from './shared/config/index.js';
import { StorageService } from './shared/utils/storage.service.js';

import { ContentService } from './shared/services/content.service.js';

const app = express();
const newsService = new NewsService();
const storageService = new StorageService();
const contentService = new ContentService();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>🚀 News Hunter API is running</h1>
      <p>Please visit the frontend to use the application:</p>
      <a href="http://localhost:3002" style="color: #eab308; font-weight: bold;">http://localhost:3002</a>
    </div>
  `);
});

// API Routes
app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || 'Türkiye ekonomi gündemi';
    const limit = parseInt(req.query.limit as string) || 5;

    console.log(`Fetching news for: ${query} (limit: ${limit})`);
    const results = await newsService.scrapeNews(query, limit);

    // Kalıcı depolamaya kaydet (Sorguya göre gruplandırılmış)
    await storageService.saveResults(query, results);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/trends', async (req: Request, res: Response) => {
  try {
    const trends = await newsService.getTrends();
    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/news/details', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL gerekli' });
    }

    const summary = await contentService.summarizeUrl(url);
    res.json({
      success: true,
      summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: 'İç sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'
  });
});

app.listen(config.port, () => {
  console.log(`
  🚀 News Hunter Server Ready
  📡 Port: ${config.port}
  🌍 Mode: Development
  `);
});
