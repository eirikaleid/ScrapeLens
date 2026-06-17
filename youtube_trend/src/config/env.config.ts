import dotenv from 'dotenv';
dotenv.config();

export const config = {
  apifyApiKey: process.env.APIFY_API_KEY || '',
  port: process.env.PORT || 3000,
};

if (!config.apifyApiKey) {
  console.warn('Warning: APIFY_API_KEY is not defined in .env file');
}
