'use client'
import { useState } from 'react'

export default function Home() {
  const [keywords, setKeywords] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [pushTime, setPushTime] = useState('09:00')

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My AI News</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Keywords</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="AI, Technology, Science..."
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">New York</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Shanghai">Shanghai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Push Time</label>
            <input
              type="time"
              value={pushTime}
              onChange={(e) => setPushTime(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Save Preferences
          </button>
        </div>
      </div>
    </main>
  )
}
