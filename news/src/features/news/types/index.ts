export interface NewsItem {
  position: number;
  title: string;
  translated_title?: string;
  link: string;
  domain: string;
  source: string;
  date: string;
  date_utc: string;
  snippet: string;
  translated_snippet?: string;
  thumbnail?: string | undefined;
  full_summary?: string | undefined;
  language?: string | undefined;
  country?: string | undefined;
  comments?: { author: string; text: string }[] | undefined;
}

export interface ScraperInput {
  maxItems: number;
  query: string;
  gl?: string;
  hl?: string;
}
