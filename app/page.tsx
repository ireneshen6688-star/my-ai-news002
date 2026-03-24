'use client'
import { useState } from 'react'
import SetupPanel from '@/components/SetupPanel'
import NewsFeed from '@/components/NewsFeed'
import TaskManager from '@/components/TaskManager'
import type { UserPrefs, NewsItem, ScheduledTask } from '@/lib/types'

type View = 'home' | 'feed' | 'tasks'

export default function Home() {
  const [view, setView] = useState<View>('home')
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<ScheduledTask[]>([])

  async function handleSave(p: UserPrefs) {
    setPrefs(p)
    setLoading(true)
    setView('feed')
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
      setNews(getMockNews(p.keywords))
    } finally {
      setLoading(false)
    }

    // Save task if email provided
    if (p.email) {
      const newTask: ScheduledTask = {
        id: Date.now().toString(),
        keywords: p.keywords,
        timezone: p.timezone,
        pushTime: p.pushTime,
        email: p.email,
        createdAt: new Date().toISOString(),
        active: true,
      }
      setTasks(prev => [newTask, ...prev])
    }
  }

  function cancelTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, active: false } : t))
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>📰</span>
            <span>My AI News</span>
          </button>
          <nav className="ml-auto flex items-center gap-2">
            {view !== 'home' && (
              <button
                onClick={() => setView('home')}
                className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                ← Home
              </button>
            )}
            <button
              onClick={() => setView('tasks')}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                view === 'tasks'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span>📋</span>
              My Tasks
              {tasks.filter(t => t.active).length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {tasks.filter(t => t.active).length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {view === 'home' && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3 text-blue-600">
                News, tailored to you
              </h1>
              <p className="text-gray-500 text-lg">
                Pick your interests, set your schedule. We handle the rest.
              </p>
            </div>
            <SetupPanel onSave={handleSave} />
          </div>
        )}

        {view === 'feed' && prefs && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Feed</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Topics: {prefs.keywords.join(', ')} · Daily at {prefs.pushTime} ({prefs.timezone})
                  {prefs.email && <span className="ml-2 text-blue-600">· 📧 {prefs.email}</span>}
                </p>
              </div>
              <button
                onClick={() => setView('home')}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 hover:border-blue-400 px-3 py-1.5 rounded-lg"
              >
                ← Back to Home
              </button>
            </div>
            <NewsFeed items={news} loading={loading} error={null} />
          </div>
        )}

        {view === 'tasks' && (
          <TaskManager tasks={tasks} onCancel={cancelTask} onDelete={deleteTask} onBack={() => setView('home')} />
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white px-6 py-4 mt-16">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-400">
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
      url: 'https://techcrunch.com',
      publishedAt: new Date().toISOString(),
      source: 'Tech Review',
    },
    {
      title: `How ${topic} Is Changing the Way We Work`,
      description: `A deep dive into the practical applications of ${topic.toLowerCase()} across industries, from healthcare to finance.`,
      url: 'https://wired.com',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: 'Future Forward',
    },
    {
      title: `Top 10 ${topic} Tools You Should Know in 2026`,
      description: `We reviewed dozens of tools and narrowed it down to the ones that actually make a difference.`,
      url: 'https://producthunt.com',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: 'Product Hunt Daily',
    },
    {
      title: `${topic} Investment Hits Record High This Quarter`,
      description: `Venture capital funding in the ${topic.toLowerCase()} space surged to an all-time high, signaling strong market confidence.`,
      url: 'https://bloomberg.com',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      source: 'Bloomberg Tech',
    },
    {
      title: `The Ethics of ${topic}: What Experts Are Saying`,
      description: `As ${topic.toLowerCase()} becomes more pervasive, ethicists and policymakers are calling for clearer guidelines.`,
      url: 'https://technologyreview.com',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      source: 'MIT Technology Review',
    },
  ]
}
