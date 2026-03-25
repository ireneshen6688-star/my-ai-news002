// Cloudflare Pages Function: /api/news
// Real RSS feeds by topic

const TOPIC_FEEDS = {
  'artificial intelligence': [
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://feeds.feedburner.com/venturebeat/SZYF',
  ],
  'technology': [
    'https://feeds.feedburner.com/TechCrunch',
    'https://www.wired.com/feed/rss',
  ],
  'finance': [
    'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    'https://feeds.bloomberg.com/markets/news.rss',
  ],
  'science': [
    'https://www.sciencedaily.com/rss/all.xml',
  ],
  'health': [
    'https://rss.medicalnewstoday.com/featurednews.xml',
  ],
  'world news': [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  ],
  'startups': [
    'https://techcrunch.com/category/startups/feed/',
  ],
  'gaming': [
    'https://www.ign.com/articles.rss',
  ],
  'climate': [
    'https://www.theguardian.com/environment/climate-crisis/rss',
  ],
  'crypto': [
    'https://cointelegraph.com/rss',
  ],
}

const DEFAULT_FEEDS = [
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
]

async function fetchRSS(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MyAINews/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items = []
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]

    for (const match of itemMatches) {
      const item = match[1]
      const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
      const link = item.match(/<link>([^<]+)<\/link>/)?.[1]?.trim()
        || item.match(/<link[^>]+href="([^"]+)"/)?.[1]?.trim()
      const desc = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]
        ?.replace(/<[^>]+>/g, '')?.trim()?.slice(0, 200)
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim()
      const image = item.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1]
        || item.match(/<enclosure[^>]+url="([^"]+)"/)?.[1]

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

export async function onRequestGet({ request }) {
  const url = new URL(request.url)
  const keywordsParam = url.searchParams.get('keywords') || 'technology'
  const keywords = keywordsParam.split(',').map(k => k.trim().toLowerCase())

  const feedUrls = new Set()
  for (const kw of keywords) {
    const feeds = TOPIC_FEEDS[kw] || []
    feeds.forEach(f => feedUrls.add(f))
  }
  if (feedUrls.size === 0) {
    DEFAULT_FEEDS.forEach(f => feedUrls.add(f))
  }

  const feedList = [...feedUrls].slice(0, 4)
  const results = await Promise.all(feedList.map(fetchRSS))
  let articles = results.flat()

  // Sort newest first
  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

  // Deduplicate
  const seen = new Set()
  articles = articles.filter(a => {
    const key = a.title.slice(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return new Response(JSON.stringify({ articles: articles.slice(0, 10) }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
