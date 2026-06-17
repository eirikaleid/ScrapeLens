// @ts-ignore
import translate from 'translate-google-api';

export class TranslationService {
  async translateToTurkish(text: string): Promise<string> {
    if (!text) return '';
    try {
      const result = await translate(text, {
        tld: 'com',
        to: 'tr',
      });
      return result[0] || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original
    }
  }

  async translateToEnglish(text: string): Promise<string> {
    if (!text) return '';
    try {
      const result = await translate(text, {
        tld: 'com',
        to: 'en',
      });
      return result[0] || text;
    } catch (error) {
      console.error('Translation to English error:', error);
      return text;
    }
  }

  async translateBatch(texts: string[]): Promise<string[]> {
    try {
      // Small batches to avoid rate limiting
      const translated = await Promise.all(
        texts.map(t => this.translateToTurkish(t))
      );
      return translated;
    } catch {
      return texts;
    }
  }
}
