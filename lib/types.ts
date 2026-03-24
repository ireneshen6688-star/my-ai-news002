export interface UserPrefs {
  keywords: string[]
  timezone: string
  pushTime: string
}

export interface NewsItem {
  title: string
  description: string
  url: string
  image?: string
  publishedAt: string
  source?: string
}
