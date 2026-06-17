import { ApifyClient } from 'apify-client';
import { config } from '../../../shared/config/index.js';
import type { NewsItem } from '../types/index.js';
import { CacheService } from '../../../shared/utils/cache.service.js';
import { TranslationService } from '../../../shared/utils/translation.service.js';

export class NewsService {
  private client: ApifyClient;
  private cache: CacheService<NewsItem[]>;
  private translator: TranslationService;

  constructor() {
    this.client = new ApifyClient({
      token: config.apifyApiKey,
    });
    this.cache = new CacheService<NewsItem[]>(config.cacheTtl);
    this.translator = new TranslationService();
  }

  async scrapeNews(query: string, maxItems: number = 5): Promise<NewsItem[]> {
    if (!query || !query.trim()) {
      throw new Error('Arama terimi boş olamaz.');
    }
    const cacheKey = `${query.trim()}_${maxItems}`;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      console.log(`Serving from cache: ${cacheKey}`);
      return cachedData;
    }

    try {
      // Translate query to English if it's not already
      const englishQuery = await this.translator.translateToEnglish(query);
      console.log(`Original query: ${query} -> English query: ${englishQuery}`);

      // Calculate timestamp for 30 days ago (expanded from 10 to give more "healthy" results)
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

      const input = {
        mode: 'search',
        query: englishQuery,
        max_results: maxItems,
        include_comments: true,
        search_sort: 'date', // Ensure newest results first
      };

      // Start the actor and wait for it to finish
      const run = await this.client.actor(config.newsActorId).call(input);

      // Fetch results from the run's dataset
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      // Map HN results to NewsItem structure
      const newsItems: NewsItem[] = await Promise.all(items
        .filter((item: any) => {
          const itemDate = new Date(item.created_at).getTime() / 1000;
          return itemDate >= thirtyDaysAgo;
        })
        .map(async (hnItem: any, index: number) => {
          const title = hnItem.title || 'No Title';
          const url = hnItem.url || hnItem.hn_url || `https://news.ycombinator.com/item?id=${hnItem.id}`;
          const snippet = hnItem.text ? hnItem.text.substring(0, 200) : `${hnItem.score || 0} puan - ${hnItem.num_comments || 0} yorum`;
          
          let domain = 'news.ycombinator.com';
          try {
            if (hnItem.url) domain = new URL(hnItem.url).hostname;
          } catch (e) {}

          const [translatedTitle, translatedSnippet] = await Promise.all([
            this.translator.translateToTurkish(title),
            this.translator.translateToTurkish(snippet)
          ]);

          return {
            position: index + 1,
            title: title,
            translated_title: translatedTitle,
            link: url,
            domain: domain,
            source: hnItem.author ? `${hnItem.author}` : 'Hacker News',
            date: hnItem.created_at ? new Date(hnItem.created_at).toLocaleDateString('tr-TR') : 'Bugün',
            date_utc: hnItem.created_at || new Date().toISOString(),
            snippet: snippet,
            translated_snippet: translatedSnippet,
            thumbnail: undefined,
            language: 'İngilizce (Hacker News)',
            country: 'Global / ABD (Tech Community)',
            full_summary: 'Detaylı özet hazırlanıyor...'
          };
        }));

      this.cache.set(cacheKey, newsItems);
      return newsItems;
    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    }
  }

  async getTrends(): Promise<{ category: string, keywords: string[] }[]> {
    try {
      const input = {
        mode: 'top',
        max_results: 30,
      };

      const run = await this.client.actor(config.newsActorId).call(input);
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

      const allTitles = items.map((item: any) => item.title);
      
      const stopWords = ['with', 'from', 'this', 'that', 'your', 'their', 'they', 'will', 'have', 'show', 'about', 'when', 'what', 'where', 'some', 'than', 'into'];
      const phrases: string[] = [];
      
      allTitles.forEach((title: string) => {
        // 1. Proper Noun Sequences (Entities)
        const entities = title.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g);
        if (entities) phrases.push(...entities);

        // 2. Bi-grams and Tri-grams of significant words
        const cleanWords = title.replace(/[^\w\s]/g, '').split(/\s+/)
          .filter(w => w.length > 2);
        
        for (let i = 0; i < cleanWords.length - 1; i++) {
          const w1 = cleanWords[i];
          const w2 = cleanWords[i+1];
          const w3 = cleanWords[i+2];

          if (w1 && w2 && !stopWords.includes(w1.toLowerCase()) && !stopWords.includes(w2.toLowerCase())) {
            phrases.push(`${w1} ${w2}`);
            if (w3 && !stopWords.includes(w3.toLowerCase())) {
              phrases.push(`${w1} ${w2} ${w3}`);
            }
          }
        }
      });

      const freq: Record<string, number> = {};
      phrases.forEach((p: string) => {
        const normalized = p.toLowerCase().trim();
        if (normalized.length > 5) {
          freq[p] = (freq[p] || 0) + 1;
        }
      });

      // Prefer longer phrases if they have similar frequency
      const sortedPhrases = Object.entries(freq)
        .sort((a, b) => {
          if (b[1] !== a[1]) return b[1] - a[1];
          return b[0].length - a[0].length;
        })
        .slice(0, 20)
        .map(([phrase]) => phrase);

      const categories = [
        { category: 'Teknoloji', keywords: [] as string[], match: ['ai', 'software', 'google', 'apple', 'web', 'data', 'code', 'python', 'tech', 'rust', 'linux', 'dev', 'chip', 'browser', 'open', 'source', 'framework', 'cloud', 'app', 'intelligence', 'artificial'] },
        { category: 'İş Dünyası', keywords: [] as string[], match: ['startup', 'money', 'business', 'ipo', 'market', 'finance', 'company', 'vc', 'fund', 'ceo', 'job', 'layoff', 'growth', 'deal', 'economy', 'billion', 'million'] },
        { category: 'Bilim', keywords: [] as string[], match: ['space', 'science', 'research', 'health', 'physics', 'energy', 'nature', 'nasa', 'dna', 'climate', 'mars', 'brain', 'medical', 'physics'] },
        { category: 'Gündem', keywords: [] as string[], match: [] }
      ];

      for (const phrase of sortedPhrases) {
        const pLower = phrase.toLowerCase();
        let found = false;
        for (const cat of categories) {
          if (cat.match.some(m => pLower.includes(m))) {
            cat.keywords.push(phrase);
            found = true;
            break;
          }
        }
        if (!found) {
          const gundemCat = categories.find(c => c.category === 'Gündem');
          if (gundemCat) gundemCat.keywords.push(phrase);
        }
      }

      // Translate keywords to Turkish and ensure they are unique/clean
      const finalTrends = await Promise.all(categories
        .filter(c => c.keywords.length > 0)
        .map(async c => {
          const uniqueKeywords = Array.from(new Set(c.keywords)).slice(0, 5);
          const translatedKeywords = await Promise.all(
            uniqueKeywords.map(async kw => {
              const tr = await this.translator.translateToTurkish(kw);
              return tr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            })
          );
          return {
            category: c.category,
            keywords: translatedKeywords
          };
        }));

      return finalTrends;

    } catch (error) {
      console.error('Trends error:', error);
      return [
        { category: 'Gündem', keywords: ['AI', 'Tech', 'Startups', 'Future', 'Programming'] }
      ];
    }
  }
}
