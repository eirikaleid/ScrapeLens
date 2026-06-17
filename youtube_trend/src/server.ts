import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.config';
import { YouTubeController } from './features/youtube/youtube.controller';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/trends', YouTubeController.getTrends);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Set timeout to 5 minutes for long scraping tasks
server.timeout = 300000;
