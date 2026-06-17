export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  viewCount: number;
  date: string;
  likes?: number;
  channelName: string;
  channelUrl: string;
  duration: string;
  description?: string;
}

export interface ScrapeOptions {
  maxResults: number;
  searchTerms?: string[];
  trendingUrl?: string;
}
