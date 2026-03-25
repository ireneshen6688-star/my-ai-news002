import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function fetchNews(keywords: string[]): Promise<{ title: string; description: string; url: string; source: string }[]> {
  const q = keywords.join(' OR ')
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=5&apikey=${process.env.GNEWS_API_KEY || 'demo'}`
    )
    if (!res.ok) throw new Error('gnews failed')
    const data = await res.json()
    return (data.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description || '',
      url: a.url,
      source: a.source?.name || '',
    }))
  } catch {
    return keywords.slice(0, 1).map(topic => ([
      { title: `${topic}: Top Stories Today`, description: `Latest developments in ${topic}`, url: 'https://news.google.com', source: 'Google News' },
    ])).flat()
  }
}

function buildDigestHtml(email: string, keywords: string[], articles: { title: string; description: string; url: string; source: string }[]) {
  const articleRows = articles.map((a, i) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
        <span style="color: #9ca3af; font-size: 12px; font-weight: bold;">${String(i + 1).padStart(2, '0')}</span>
        <a href="${a.url}" style="display: block; color: #111827; font-weight: 600; font-size: 15px; margin: 4px 0; text-decoration: none;">${a.title}</a>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">${a.description}</p>
        <span style="background: #f3f4f6; color: #6b7280; font-size: 11px; padding: 2px 8px; border-radius: 999px;">${a.source}</span>
      </td>
    </tr>
  `).join('')

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #2563eb; font-size: 22px; margin-bottom: 4px;">📰 Your Daily AI News Digest</h1>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
        Topics: <strong>${keywords.join(', ')}</strong> · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        ${articleRows}
      </table>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        My AI News · <a href="https://myainews.club" style="color: #9ca3af;">myainews.club</a>
      </p>
    </div>
  `
}

// Called by Cloudflare Cron Trigger
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // @ts-ignore
    const raw = typeof SUBSCRIPTIONS !== 'undefined' ? await SUBSCRIPTIONS.get('all') : null
    const subs: { email: string; keywords: string[]; pushTime: string; timezone: string; active: boolean }[] = raw ? JSON.parse(raw) : []
    const activeSubs = subs.filter(s => s.active)

    if (activeSubs.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    let sent = 0
    for (const sub of activeSubs) {
      const articles = await fetchNews(sub.keywords)
      const html = buildDigestHtml(sub.email, sub.keywords, articles)
      const { error } = await resend.emails.send({
        from: 'My AI News <noreply@myainews.club>',
        to: sub.email,
        subject: `📰 Your Daily News Digest — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        html,
      })
      if (!error) sent++
    }

    return NextResponse.json({ sent, total: activeSubs.length })
  } catch (err) {
    console.error('Digest send error:', err)
    return NextResponse.json({ error: 'Failed to send digests' }, { status: 500 })
  }
}
