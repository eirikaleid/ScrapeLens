import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, TrendingUp, Briefcase, ExternalLink, RefreshCw, AlertCircle, X, Globe, Languages, MessageSquare } from 'lucide-react';

interface NewsItem {
  position: number;
  title: string;
  link: string;
  domain: string;
  source: string;
  date: string;
  date_utc: string;
  snippet: string;
  translated_title?: string;
  translated_snippet?: string;
  thumbnail?: string;
  business_opportunity?: string;
  full_summary?: string;
  language?: string;
  country?: string;
  comments?: { author: string; text: string }[];
}

interface TrendCategory {
  category: string;
  keywords: string[];
}

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('Yapay zeka');
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [trends, setTrends] = useState<TrendCategory[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  const fetchNews = async (searchQuery: string = query, abortController?: AbortController) => {
    if (!searchQuery.trim()) {
      setError('Lütfen bir arama terimi girin.');
      return;
    }
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const newsLimit = import.meta.env.VITE_NEWS_LIMIT || 20;
    try {
      const response = await axios.get(`${baseUrl}/api/news?q=${encodeURIComponent(searchQuery)}&limit=${newsLimit}`, {
        signal: abortController?.signal
      });
      if (response.data.success) {
        setNews(response.data.data);
      } else {
        setError('Haberler alınamadı.');
      }
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      setError(err.response?.data?.error || 'Sunucu bağlantı hatası. Backend çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    setLoadingTrends(true);
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    try {
      const response = await axios.get(`${baseUrl}/api/trends`);
      if (response.data.success) {
        setTrends(response.data.data);
      }
    } catch (err) {
      console.error('Trendleri getirme hatası:', err);
    } finally {
      setLoadingTrends(false);
    }
  };

  const fetchDetails = async (url: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    try {
      const response = await axios.get(`${baseUrl}/api/news/details?url=${encodeURIComponent(url)}`);
      if (response.data.success) {
        setNews(prev => prev.map(item =>
          item.link === url ? { ...item, full_summary: response.data.summary } : item
        ));
        if (selectedNews?.link === url) {
          setSelectedNews(prev => prev ? { ...prev, full_summary: response.data.summary } : null);
        }
      }
    } catch (err) {
      console.error('Detay getirme hatası:', err);
    }
  };

  useEffect(() => {
    if (selectedNews && selectedNews.full_summary === 'Detaylı özet hazırlanıyor...') {
      fetchDetails(selectedNews.link);
    }
  }, [selectedNews]);

  useEffect(() => {
    const controller = new AbortController();
    fetchNews(query, controller);
    fetchTrends();
    return () => controller.abort();
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">🦅</div>
          <h1 className="logo-text">Haber Avcısı</h1>
        </div>
        <p className="subtitle">Dünya gündemini takip edin, fırsatları yakalayın.</p>

        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Haber veya konu ara..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchNews()}
            />
          </div>
          <button className="search-btn" onClick={() => fetchNews()} disabled={loading}>
            {loading ? <RefreshCw className="spinner-icon" size={20} /> : <Search size={20} />}
            {loading ? 'Avlanıyor...' : 'Haber Avla'}
          </button>
        </div>

        {trends.length > 0 && (
          <div className="trends-container">
            <div className="trends-header">
              <h2><TrendingUp size={20} /> Günün Trend Konuları</h2>
              <button 
                className="refresh-trends-btn" 
                onClick={fetchTrends} 
                disabled={loadingTrends}
              >
                {loadingTrends ? <RefreshCw className="spinner-icon" size={14} /> : <RefreshCw size={14} />}
                Gündemi Tazele
              </button>
            </div>
            <div className="trends-grid">
              {trends.map((cat, i) => (
                <div key={i} className="trend-category">
                  <h3>{cat.category}</h3>
                  <div className="trend-tags">
                    {cat.keywords.map((kw, j) => (
                      <span 
                        key={j} 
                        className={`trend-tag ${query === kw ? 'active' : ''}`}
                        onClick={() => fetchNews(kw)}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {error && (
        <div className="empty-state" style={{ color: '#ef4444' }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Dünya gündemi taranıyor...</p>
        </div>
      ) : (
        <div className="news-grid">
          {news.length > 0 ? (
            news.map((item, index) => (
              <article key={index} className="news-card">
                {item.thumbnail && (
                  <img src={item.thumbnail} alt={item.title} className="news-image" />
                )}
                <div className="news-content">
                  {item.business_opportunity && (
                    <div className="opportunity-badge">
                      <Briefcase size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {item.business_opportunity}
                    </div>
                  )}
                  <span className="news-source">{item.source}</span>
                  <h2 className="news-title">{item.translated_title || item.title}</h2>
                  <p className="news-snippet">{item.translated_snippet || item.snippet}</p>
                  <button className="detail-btn" onClick={() => setSelectedNews(item)}>
                    Haber Detayları & Özet
                  </button>
                  <div className="news-footer" style={{ marginTop: '1rem' }}>
                    <span>{item.date}</span>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
              </article>
            ))
          ) : (
            !error && (
              <div className="empty-state">
                <TrendingUp size={48} style={{ marginBottom: '1rem' }} />
                <p>Henüz bir haber bulunamadı. Aramayı deneyin.</p>
              </div>
            )
          )}
        </div>
      )}

      {selectedNews && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedNews(null)}>
              <X size={24} />
            </button>

            <h2 className="modal-title">{selectedNews.translated_title || selectedNews.title}</h2>

            <div className="modal-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Globe size={16} /> {selectedNews.country}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Languages size={16} /> {selectedNews.language}
              </span>
              <span>{selectedNews.date}</span>
            </div>

            <div className="modal-section">
              <h3><TrendingUp size={18} /> Profesyonel Haber Özeti</h3>
              <div className="modal-summary">
                {selectedNews.full_summary}
              </div>
            </div>

            {selectedNews.comments && selectedNews.comments.length > 0 && (
              <div className="modal-section">
                <h3><MessageSquare size={18} /> Öne Çıkan Yorumlar (Orijinal)</h3>
                {selectedNews.comments.map((comment, idx) => (
                  <div key={idx} className="comment-card">
                    <div className="comment-author">{comment.author}</div>
                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{comment.text}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <a
                href={selectedNews.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--accent-primary)',
                  color: '#000',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                Habere Git <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
