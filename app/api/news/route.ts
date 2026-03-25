import { NextRequest, NextResponse } from 'next/server'

const TOPIC_FEEDS: Record<string, string[]> = {
  'artificial intelligence': ['https://techcrunch.com/category/artificial-intelligence/feed/'],
  'technology': ['https://feeds.feedburner.com/TechCrunch', 'https://www.wired.com/feed/rss'],
  'finance': ['https://www.cnbc.com/id/10000664/device/rss/rss.html'],
  'science': ['https://www.sciencedaily.com/rss/all.xml'],
  'health': ['https://rss.medicalnewstoday.com/featurednews.xml'],
  'world news': ['https://feeds.bbci.co.uk/news/world/rss.xml'],
  'startups': ['https://techcrunch.com/category/startups/feed/'],
  'gaming': ['https://www.ign.com/articles.rss'],
  'climate': ['https://www.theguardian.com/environment/climate-crisis/rss'],
  'crypto': ['https://cointelegraph.com/rss'],
}

async function fetchRSS(url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return []
    const xml = await res.text()
    const items: any[] = []
    const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    for (const m of matches) {
      const item = m[1]
      const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
      const link = item.match(/<link>([^<]+)<\/link>/)?.[1]?.trim()
      const desc = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.replace(/<[^>]+>/g, '')?.trim()?.slice(0, 200)
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim()
      if (title && link) {
        items.push({ title, description: desc || '', url: link, source: new URL(url).hostname.split('.')[0], publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString() })
      }
      if (items.length >= 5) break
    }
    return items
  } catch { return [] }
}

export async function GET(req: NextRequest) {
  const kw = req.nextUrl.searchParams.get('keywords') || 'technology'
  const keywords = kw.split(',').map(k => k.trim().toLowerCase())
  const feeds = new Set<string>()
  keywords.forEach(k => (TOPIC_FEEDS[k] || []).forEach(f => feeds.add(f)))
  if (!feeds.size) feeds.add('https://feeds.bbci.co.uk/news/rss.xml')
  const results = await Promise.all([...feeds].slice(0, 4).map(fetchRSS))
  let articles = results.flat().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  const seen = new Set()
  articles = articles.filter(a => { const k = a.title.slice(0, 50); if (seen.has(k)) return false; seen.add(k); return true })
  return NextResponse.json({ articles: articles.slice(0, 10) })
}
