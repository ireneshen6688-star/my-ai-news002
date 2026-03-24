export interface UserPrefs {
  keywords: string[]
  timezone: string
  pushTime: string
  email?: string
}

export interface NewsItem {
  title: string
  description: string
  url: string
  image?: string
  publishedAt: string
  source?: string
}

export interface ScheduledTask {
  id: string
  keywords: string[]
  timezone: string
  pushTime: string
  email: string
  createdAt: string
  active: boolean
}
