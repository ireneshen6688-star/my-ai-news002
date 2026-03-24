'use client'
import { useState } from 'react'
import SetupPanel from '@/components/SetupPanel'
import NewsFeed from '@/components/NewsFeed'
import type { UserPrefs, NewsItem } from '@/lib/types'

export default function Home() {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(p: UserPrefs) {
    setPrefs(p)
    setLoading(true)
    setError(null)
    try {
      const q = p.keywords.join(' OR ')
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=10&apikey=demo`
      )
      if (!res.ok) throw new Error('Failed to fetch news')
      const data = await res.json()
      setNews(
        (data.articles || []).map((a: any) => ({
          title: a.title,
          description: a.description,
          url: a.url,
          image: a.image,
          publishedAt: a.publishedAt,
          source: a.source?.name,
        }))
      )
    } catch {
      // fallback to mock data so the UI always shows something
      setNews(getMockNews(p.keywords))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span className="text-2xl">📰</span>
          <span className="font-bold text-xl tracking-tight">My AI News</span>
          <span className="ml-auto text-sm text-slate-500 hidden sm:block">
            Personalized · AI-curated · Your schedule
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {!prefs ? (
          <div className="max-w-xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                News, tailored to you
              </h1>
              <p className="text-slate-400 text-lg">
                Pick your interests, set your schedule. We handle the rest.
              </p>
            </div>
            <SetupPanel onSave={handleSave} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Your Feed</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Topics: {prefs.keywords.join(', ')} · Daily at {prefs.pushTime} ({prefs.timezone})
                </p>
              </div>
              <button
                onClick={() => { setPrefs(null); setNews([]) }}
                className="text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 px-3 py-1.5 rounded-lg"
              >
                Edit preferences
              </button>
            </div>
            <NewsFeed items={news} loading={loading} error={error} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 px-6 py-4 mt-16">
        <div className="max-w-5xl mx-auto text-center text-sm text-slate-600">
          My AI News · AI-powered personalized news aggregator
        </div>
      </footer>
    </div>
  )
}

function getMockNews(keywords: string[]): NewsItem[] {
  const topic = keywords[0] || 'AI'
  return [
    {
      title: `${topic}: Major Breakthrough Announced by Leading Researchers`,
      description: `Scientists have made a significant advancement in ${topic.toLowerCase()} that could reshape the industry within the next few years.`,
      url: '#',
      publishedAt: new Date().toISOString(),
      source: 'Tech Review',
    },
    {
      title: `How ${topic} Is Changing the Way We Work`,
      description: `A deep dive into the practical applications of ${topic.toLowerCase()} across industries, from healthcare to finance.`,
      url: '#',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: 'Future Forward',
    },
    {
      title: `Top 10 ${topic} Tools You Should Know in 2026`,
      description: `We reviewed dozens of tools and narrowed it down to the ones that actually make a difference.`,
      url: '#',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: 'Product Hunt Daily',
    },
    {
      title: `${topic} Investment Hits Record High This Quarter`,
      description: `Venture capital funding in the ${topic.toLowerCase()} space surged to an all-time high, signaling strong market confidence.`,
      url: '#',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      source: 'Bloomberg Tech',
    },
    {
      title: `The Ethics of ${topic}: What Experts Are Saying`,
      description: `As ${topic.toLowerCase()} becomes more pervasive, ethicists and policymakers are calling for clearer guidelines.`,
      url: '#',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      source: 'MIT Technology Review',
    },
  ]
}
