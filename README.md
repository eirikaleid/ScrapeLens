<div align="center">

# ⚡ ScrapeLens

### Apify-powered intelligence scrapers for Hacker News & YouTube Trends

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Apify](https://img.shields.io/badge/Powered%20by-Apify-FF9900?style=flat-square)](https://apify.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**ScrapeLens** is a monorepo of two independent scraping microservices.  
Each service exposes a clean REST API and ships with its own frontend.

[News Hunter](#-news-hunter) · [YouTube Trends](#-youtube-trend-scraper) · [Quick Start](#-quick-start) · [API Reference](#-api-reference)

</div>

---

## 📦 Monorepo Overview

```
ScrapeLens/
├── news/              # Hacker News scraper + React dashboard (ports 3001 / 5173)
└── youtube_trend/     # YouTube trending videos scraper + HTML dashboard (port 3000)
```

Both services share a single Apify API key. They are fully independent — run one, both, or neither.

---

## 🦅 News Hunter

A full-stack news intelligence service. Enter any query in **Turkish or English** — the backend auto-translates, fires the Hacker News Apify actor, and returns results with translated titles, snippets, trend extraction, and per-article summaries.

### Features

- 🔍 **Keyword search** across Hacker News with auto English translation
- 📈 **Trend extraction** — top 30 HN stories analyzed into categories (Tech, Business, Science, Current Events)
- 🌐 **Auto-translation** — titles and snippets returned in Turkish via `translate-google-api`
- 🗓️ **Date filtering** — only articles from the last 30 days
- ⚡ **In-memory cache** — configurable TTL to avoid redundant Apify calls
- 💾 **Persistent storage** — query results saved locally as JSON grouped by search term
- 🖥️ **React dashboard** — search UI, trend tags, article modal with full summary

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Express · TypeScript (ESM) · `apify-client` |
| Translation | `translate-google-api` |
| Frontend | React 19 · Vite · TypeScript · Axios · Lucide Icons |
| Apify Actor | `gentle_cloud/hacker-news-scraper` |

---

## 🔥 YouTube Trend Scraper

Scrapes YouTube for the **most-viewed videos of the day** using the `streamers/youtube-scraper` Apify actor. Results are displayed in a real-time browser dashboard and optionally exported as timestamped JSON.

### Features

- 📊 **Top trending videos** ranked by view count
- 📁 **JSON export** — each scrape saved as `scrapes/results_<timestamp>.json`
- ⏱️ **Long-running support** — 5-minute server timeout for heavy scraping tasks
- 🌐 **Vanilla HTML dashboard** — zero build step, works out of the box

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Express · TypeScript · `apify-client` |
| Frontend | Vanilla HTML + CSS + JavaScript |
| Apify Actor | `streamers/youtube-scraper` |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- An **Apify** account (free tier works) → [Get your API key](https://console.apify.com/account/integrations)

---

### News Hunter Setup

```bash
cd news

# Install backend + frontend deps in one step
npm run install:all

# Copy and configure environment
cp .env.example .env
```

Open `.env` and fill in your key:

```env
APIFY_API_KEY=your_apify_api_key_here
PORT=3001
APIFY_ACTOR_ID=gentle_cloud/hacker-news-scraper
CACHE_TTL=600
VITE_API_URL=http://localhost:3001
VITE_NEWS_LIMIT=6
```

```bash
# Start backend (3001) + frontend (5173) concurrently
npm run dev:all
```

Visit **http://localhost:5173** to open the dashboard.

---

### YouTube Trend Scraper Setup

```bash
cd youtube_trend

npm install

cp .env.example .env
```

```env
APIFY_API_KEY=your_apify_api_key_here
PORT=3000
```

```bash
npm run dev
```

Visit **http://localhost:3000**, then click **Refresh Trends**.

---

## 📡 API Reference

### News Hunter — `http://localhost:3001`

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/news` | `q` (string), `limit` (number) | Search Hacker News by keyword |
| `GET` | `/api/trends` | — | Trending phrases from HN front page, grouped by category |
| `GET` | `/api/news/details` | `url` (string) | Fetch and summarize an article URL |
| `GET` | `/health` | — | Health check |

**Examples**

```bash
# Search for AI news (5 results)
curl "http://localhost:3001/api/news?q=artificial+intelligence&limit=5"

# Get today's trending topics
curl "http://localhost:3001/api/trends"

# Summarize a specific article
curl "http://localhost:3001/api/news/details?url=https://example.com/article"
```

**Response shape — `/api/news`**

```json
{
  "success": true,
  "data": [
    {
      "position": 1,
      "title": "Original English Title",
      "translated_title": "Türkçe Başlık",
      "link": "https://...",
      "domain": "github.com",
      "source": "username",
      "date": "01.06.2026",
      "snippet": "Original snippet...",
      "translated_snippet": "Türkçe özet...",
      "language": "İngilizce (Hacker News)",
      "country": "Global / ABD (Tech Community)"
    }
  ]
}
```

---

### YouTube Trend Scraper — `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trends` | Fetch top trending YouTube videos |
| `GET` | `/health` | Health check |

**Example**

```bash
curl "http://localhost:3000/api/trends"
```

**Response shape**

```json
[
  {
    "id": "abc123",
    "title": "Video Title",
    "url": "https://youtube.com/watch?v=abc123",
    "thumbnailUrl": "https://...",
    "viewCount": 4200000,
    "likes": 120000,
    "channelName": "Channel Name",
    "duration": "12:34",
    "date": "2026-06-15",
    "description": "First 200 chars of description..."
  }
]
```

---

## 🗂️ Full Project Structure

```
ScrapeLens/
│
├── .gitignore                          # Root-level — covers both sub-projects
├── README.md
│
├── news/                               # ── News Hunter ──────────────────────
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── src/
│   │   ├── server.ts                   # Express entry point
│   │   ├── features/
│   │   │   └── news/
│   │   │       ├── services/
│   │   │       │   └── news.service.ts # Apify calls + trend extraction
│   │   │       └── types/index.ts
│   │   └── shared/
│   │       ├── config/index.ts
│   │       └── utils/
│   │           ├── cache.service.ts    # In-memory TTL cache
│   │           ├── storage.service.ts  # Local JSON persistence
│   │           └── translation.service.ts
│   │
│   └── client/                         # React + Vite frontend
│       ├── index.html
│       └── src/
│           ├── App.tsx                 # Main dashboard component
│           └── main.tsx
│
└── youtube_trend/                      # ── YouTube Trend Scraper ────────────
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    │
    ├── src/
    │   ├── server.ts
    │   ├── config/env.config.ts
    │   └── features/youtube/
    │       ├── youtube.controller.ts
    │       ├── youtube.service.ts      # Apify calls + JSON export
    │       └── youtube.types.ts
    │
    └── public/                         # Vanilla HTML dashboard (no build step)
        ├── index.html
        ├── script.js
        └── style.css
```

---

## 🔒 Security

> **If you accidentally expose your `APIFY_API_KEY` in a commit, revoke it immediately:**  
> [console.apify.com/account/integrations](https://console.apify.com/account/integrations)

- `.env` files are listed in `.gitignore` at both root and sub-project level
- `scrapes/` and `data/` directories are also gitignored — scraped output may contain sensitive content
- Never hardcode API keys in source files

---

## 🛠️ Scripts Reference

### News Hunter

| Command | Description |
|---|---|
| `npm run install:all` | Install backend + frontend dependencies |
| `npm run dev` | Start backend in dev mode (tsx watch) |
| `npm run client:dev` | Start frontend in dev mode (Vite) |
| `npm run dev:all` | Start both concurrently |
| `npm run build` | Compile backend TypeScript → `dist/` |
| `npm run client:build` | Build frontend → `client/dist/` |
| `npm start` | Run compiled backend |

### YouTube Trend Scraper

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start server in dev mode (ts-node-dev) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled server |

---

## 📋 Environment Variables

### News Hunter (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `APIFY_API_KEY` | ✅ | — | Your Apify API token |
| `PORT` | ❌ | `3001` | Backend server port |
| `APIFY_ACTOR_ID` | ❌ | `gentle_cloud/hacker-news-scraper` | Apify actor for HN |
| `CACHE_TTL` | ❌ | `600` | Cache lifetime in seconds |
| `VITE_API_URL` | ❌ | `http://localhost:3001` | Frontend → backend URL |
| `VITE_NEWS_LIMIT` | ❌ | `6` | Default result count |

### YouTube Trend Scraper (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `APIFY_API_KEY` | ✅ | — | Your Apify API token |
| `PORT` | ❌ | `3000` | Server port |

---

## 📄 License

MIT © 2026 — See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with <a href="https://apify.com">Apify</a> · <a href="https://expressjs.com">Express</a> · <a href="https://react.dev">React</a> · <a href="https://www.typescriptlang.org">TypeScript</a></sub>
</div>
