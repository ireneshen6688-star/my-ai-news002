import type { NewsItem } from '@/lib/types'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const isClickable = item.url && item.url !== '#'
  const Tag = isClickable ? 'a' : 'div'
  const linkProps = isClickable
    ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Tag
      {...linkProps}
      className={`group block bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition-all ${
        isClickable ? 'hover:border-blue-300 hover:shadow-md cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl font-bold text-gray-200 w-8 shrink-0 mt-0.5">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 leading-snug mb-2 ${isClickable ? 'group-hover:text-blue-600' : ''} transition-colors`}>
            {item.title}
          </h3>
          {item.description && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {item.source && (
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.source}</span>
            )}
            <span>{timeAgo(item.publishedAt)}</span>
            {isClickable && (
              <span className="ml-auto text-blue-500 group-hover:text-blue-600 font-medium">
                Read more →
              </span>
            )}
          </div>
        </div>
        {item.image && (
          <img
            src={item.image}
            alt=""
            className="w-20 h-20 rounded-xl object-cover shrink-0 hidden sm:block"
          />
        )}
      </div>
    </Tag>
  )
}

export default function NewsFeed({
  items,
  loading,
  error,
}: {
  items: NewsItem[]
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse shadow-sm">
            <div className="flex gap-4">
              <div className="w-8 h-6 bg-gray-100 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg mb-2">Couldn't load live news</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No articles found. Try different keywords.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <NewsCard key={i} item={item} index={i} />
      ))}
    </div>
  )
}
