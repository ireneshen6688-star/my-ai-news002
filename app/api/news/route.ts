import { NextRequest, NextResponse } from 'next/server'

// Real RSS feeds by topic
const TOPIC_FEEDS: Record<string, string[]> = {
  'artificial intelligence': [
    'https://feeds.feedburner.com/venturebeat/SZYF',
    'https://techcrunch.com/category/artificial-intelligence/feed/',
  ],
  'technology': [
    'https://feeds.feedburner.com/TechCrunch',
    'https://www.wired.com/feed/rss',
  ],
  'finance': [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.cnbc.com/id/10000664/device/rss/rss.html',
  ],
  'science': [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://feeds.nature.com/nature/rss/current',
  ],
  'health': [
    'https://rss.medicalnewstoday.com/featurednews.xml',
    'https://www.who.int/rss-feeds/news-english.xml',
  ],
  'world news': [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  ],
  'startups': [
    'https://techcrunch.com/category/startups/feed/',
    'https://feeds.feedburner.com/venturebeat/SZYF',
  ],
  'gaming': [
    'https://www.ign.com/articles.rss',
    'https://kotaku.com/rss',
  ],
  'climate': [
    'https://www.theguardian.com/environment/climate-crisis/rss',
    'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  ],
  'crypto': [
    'https://cointelegraph.com/rss',
    'https://coindesk.com/arc/outboundfeeds/rss/',
  ],
}

const DEFAULT_FEEDS = [
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
]

interface NewsItem {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  image?: string
}

async function fetchRSS(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MyAINews/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: NewsItem[] = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

    for (const match of itemMatches) {
      const item = match[1]
      const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
      const link = item.match(/<link>([^<]+)<\/link>/)?.[1]?.trim()
        || item.match(/<link[^>]+href="([^"]+)"/)?.[1]?.trim()
      const desc = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]
        ?.replace(/<[^>]+>/g, '')?.trim()?.slice(0, 200)
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim()
        || item.match(/<dc:date>(.*?)<\/dc:date>/)?.[1]?.trim()
      const image = item.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1]
        || item.match(/<enclosure[^>]+url="([^"]+)"/)?.[1]

      // Extract source name from feed URL
      const sourceName = new URL(url).hostname.replace('www.', '').replace('feeds.', '').split('.')[0]

      if (title && link) {
        items.push({
          title,
          description: desc || '',
          url: link,
          source: sourceName,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          image,
        })
      }
      if (items.length >= 5) break
    }
    return items
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keywordsParam = searchParams.get('keywords') || 'technology'
  const keywords = keywordsParam.split(',').map(k => k.trim().toLowerCase())

  // Collect relevant feeds
  const feedUrls = new Set<string>()
  for (const kw of keywords) {
    const feeds = TOPIC_FEEDS[kw] || []
    feeds.forEach(f => feedUrls.add(f))
  }
  if (feedUrls.size === 0) {
    DEFAULT_FEEDS.forEach(f => feedUrls.add(f))
  }

  // Fetch all feeds in parallel (max 4 feeds)
  const feedList = Array.from(feedUrls).slice(0, 4)
  const results = await Promise.all(feedList.map(fetchRSS))
  let articles = results.flat()

  // Sort by date, newest first
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  // Deduplicate by title
  const seen = new Set<string>()
  articles = articles.filter(a => {
    const key = a.title.slice(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return NextResponse.json({ articles: articles.slice(0, 10) })
}
