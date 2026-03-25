import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, keywords, pushTime, timezone } = await req.json()

    if (!email || !keywords?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Send confirmation email
    const { error } = await resend.emails.send({
      from: 'My AI News <noreply@myainews.club>',
      to: email,
      subject: '✅ You\'re subscribed to My AI News!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 8px;">📰 My AI News</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">You're all set! Here's your subscription summary:</p>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px;"><strong>Topics:</strong> ${keywords.join(', ')}</p>
            <p style="margin: 0 0 8px;"><strong>Daily digest time:</strong> ${pushTime} (${timezone})</p>
            <p style="margin: 0;"><strong>Delivery:</strong> ${email}</p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Your first digest will arrive tomorrow at ${pushTime}. 
            We'll curate the top news based on your selected topics.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">My AI News · AI-powered personalized news aggregator</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // Store subscription in KV (via Cloudflare binding)
    // @ts-ignore
    if (typeof SUBSCRIPTIONS !== 'undefined') {
      // @ts-ignore
      const existing = await SUBSCRIPTIONS.get('all') 
      const subs = existing ? JSON.parse(existing) : []
      subs.push({ email, keywords, pushTime, timezone, createdAt: new Date().toISOString(), active: true })
      // @ts-ignore
      await SUBSCRIPTIONS.put('all', JSON.stringify(subs))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
