import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, keywords, pushTime, timezone } = await req.json()
    if (!email || !keywords?.length) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Email not configured' }, { status: 500 })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'My AI News <noreply@myainews.club>',
        to: email,
        subject: "✅ You're subscribed to My AI News!",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="color:#2563eb;">📰 My AI News</h1>
          <p>You're subscribed! Here's your summary:</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:16px 0;">
            <p><strong>Topics:</strong> ${keywords.join(', ')}</p>
            <p><strong>Daily at:</strong> ${pushTime} (${timezone})</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          <p style="color:#6b7280;font-size:14px;">Your first digest arrives tomorrow at ${pushTime}.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
          <p style="color:#9ca3af;font-size:12px;">My AI News · myainews.club</p>
        </div>`,
      }),
    })

    if (!res.ok) return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
