import fs from 'fs/promises';
import path from 'path';
import type { NewsItem } from '../../features/news/types/index.js';

export class StorageService {
  private storagePath: string;

  constructor() {
    this.storagePath = path.join(process.cwd(), 'data', 'history.json');
    this.initStorage();
  }

  private async initStorage() {
    try {
      const dir = path.dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });
      
      try {
        await fs.access(this.storagePath);
      } catch {
        await fs.writeFile(this.storagePath, JSON.stringify({}, null, 2));
      }
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  }

  async saveResults(query: string, results: NewsItem[]) {
    try {
      const content = await fs.readFile(this.storagePath, 'utf-8');
      const history = JSON.parse(content);

      if (!history[query]) {
        history[query] = [];
      }

      // Add only new results based on link/id
      const existingLinks = new Set(history[query].map((item: NewsItem) => item.link));
      const newItems = results.filter(item => !existingLinks.has(item.link));

      history[query] = [...newItems, ...history[query]].slice(0, 100); // Keep last 100 per query

      await fs.writeFile(this.storagePath, JSON.stringify(history, null, 2));
      console.log(`Saved ${newItems.length} new items to history for query: ${query}`);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  async getHistory() {
    try {
      const content = await fs.readFile(this.storagePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
}
