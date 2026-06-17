import { ApifyClient } from 'apify-client';
import { config } from '../config/index.js';
import { TranslationService } from '../utils/translation.service.js';

export class ContentService {
  private client: ApifyClient;
  private translator: TranslationService;

  constructor() {
    this.client = new ApifyClient({
      token: config.apifyApiKey,
    });
    this.translator = new TranslationService();
  }

  async summarizeUrl(url: string): Promise<string> {
    try {
      console.log(`Deep scraping content from: ${url}`);
      
      // Use website-content-crawler for deep extraction
      const run = await this.client.actor('apify/website-content-crawler').call({
        startUrls: [{ url }],
        maxCrawlPages: 1,
        crawlerType: 'playwright:firefox',
      });

      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      const content = (items[0] as any)?.text || '';

      if (!content || typeof content !== 'string') return 'İçerik çekilemedi.';

      // Take a chunk of content (to avoid token limits/cost)
      const chunk = content.substring(0, 3000);
      
      // Translate and summarize
      const summary = await this.translator.translateToTurkish(
        `Summary of this article: ${chunk.substring(0, 500)}...`
      );

      return summary;
    } catch (error) {
      console.error('Content extraction error:', error);
      return 'Haber detayı şu an alınamıyor.';
    }
  }
}
