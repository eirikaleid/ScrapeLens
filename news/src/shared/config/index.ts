import dotenv from 'dotenv';
dotenv.config();

export const config = {
  apifyApiKey: process.env.APIFY_API_KEY || '',
  port: Number(process.env.PORT) || 3001,
  newsActorId: process.env.APIFY_ACTOR_ID || 'easyapi/google-news-scraper',
  cacheTtl: Number(process.env.CACHE_TTL) || 600,
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3001'
};

if (!config.apifyApiKey) {
  console.warn('WARNING: APIFY_API_KEY is not defined in .env file.');
}
