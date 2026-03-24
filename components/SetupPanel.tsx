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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const keywords = selected.length > 0 ? selected : ['AI']
    onSave({ keywords, timezone, pushTime })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Topics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-1">What are you interested in?</h2>
        <p className="text-slate-400 text-sm mb-4">Pick topics or add your own keywords</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_TAGS.map(tag => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selected.includes(tag.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addCustom}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selected.map(kw => (
              <span key={kw} className="flex items-center gap-1 bg-blue-900/40 text-blue-300 text-xs px-2.5 py-1 rounded-full">
                {kw}
                <button type="button" onClick={() => toggleTag(kw)} className="hover:text-white">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Schedule */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-1">When do you want your news?</h2>
        <p className="text-slate-400 text-sm mb-4">We'll deliver a fresh digest at this time every day</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Time</label>
            <input
              type="time"
              value={pushTime}
              onChange={e => setPushTime(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        Show my news →
      </button>
    </form>
  )
}
