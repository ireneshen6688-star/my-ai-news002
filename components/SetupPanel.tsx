'use client'
import { useState } from 'react'
import type { UserPrefs } from '@/lib/types'

const PRESET_TAGS = [
  { label: '🤖 AI', value: 'artificial intelligence' },
  { label: '💻 Tech', value: 'technology' },
  { label: '💰 Finance', value: 'finance' },
  { label: '🔬 Science', value: 'science' },
  { label: '🏥 Health', value: 'health' },
  { label: '🌍 World', value: 'world news' },
  { label: '🚀 Startups', value: 'startups' },
  { label: '🎮 Gaming', value: 'gaming' },
  { label: '🌱 Climate', value: 'climate' },
  { label: '🔐 Crypto', value: 'crypto' },
]

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'New York (ET)', value: 'America/New_York' },
  { label: 'Los Angeles (PT)', value: 'America/Los_Angeles' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
]

export default function SetupPanel({ onSave }: { onSave: (p: UserPrefs) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [pushTime, setPushTime] = useState('08:00')
  const [email, setEmail] = useState('')
  const [sendTest, setSendTest] = useState(false)
  const [testSent, setTestSent] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState('')

  function toggleTag(value: string) {
    setSelected(s => s.includes(value) ? s.filter(v => v !== value) : [...s, value])
  }

  function addCustom() {
    const trimmed = custom.trim()
    if (trimmed && !selected.includes(trimmed)) {
      setSelected(s => [...s, trimmed])
      setCustom('')
    }
  }

  async function handleSendTest() {
    if (!email.trim()) return
    setTestLoading(true)
    setTestError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          keywords: selected.length > 0 ? selected : ['AI'],
          pushTime,
          timezone,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setTestSent(true)
      setTimeout(() => setTestSent(false), 4000)
    } catch {
      setTestError('Failed to send. Check your email and try again.')
    } finally {
      setTestLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const keywords = selected.length > 0 ? selected : ['AI']
    onSave({ keywords, timezone, pushTime, email: email.trim() || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Step 1: Topics */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg text-gray-900 mb-1">What are you interested in?</h2>
        <p className="text-gray-500 text-sm mb-4">Pick topics or add your own keywords</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_TAGS.map(tag => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selected.includes(tag.value)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="Add a custom keyword..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={addCustom}
            className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-lg text-sm transition-colors text-gray-700"
          >
            Add
          </button>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selected.map(kw => (
              <span key={kw} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-100">
                {kw}
                <button type="button" onClick={() => toggleTag(kw)} className="hover:text-blue-900 ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Schedule */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg text-gray-900 mb-1">When do you want your news?</h2>
        <p className="text-gray-500 text-sm mb-4">We'll deliver a fresh digest at this time every day</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Time</label>
            <input
              type="time"
              value={pushTime}
              onChange={e => setPushTime(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Step 3: Email */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg text-gray-900 mb-1">Get it in your inbox <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
        <p className="text-gray-500 text-sm mb-4">Enter your email to receive daily news digests</p>

        <div className="flex gap-2 mb-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
        </div>

        {email.trim() && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendTest}
                onChange={e => setSendTest(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Send me a sample digest now</span>
            </label>
            {sendTest && (
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testLoading}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  testSent
                    ? 'bg-green-100 text-green-700'
                    : testLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {testSent ? '✓ Sent!' : testLoading ? 'Sending...' : 'Send test →'}
              </button>
            )}
            {testError && <p className="text-xs text-red-500 mt-1">{testError}</p>}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
      >
        Show my news →
      </button>
    </form>
  )
}
