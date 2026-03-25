// Cloudflare Pages Function: /api/subscribe
// Sends confirmation email via Resend

export async function onRequestPost({ request, env }) {
  try {
    const { email, keywords, pushTime, timezone } = await request.json()

    if (!email || !keywords?.length) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const RESEND_API_KEY = env.RESEND_API_KEY
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Send confirmation email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'My AI News <noreply@myainews.club>',
        to: email,
        subject: "✅ You're subscribed to My AI News!",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
            <h1 style="color:#2563eb;font-size:24px;margin-bottom:8px;">📰 My AI News</h1>
            <p style="color:#6b7280;margin-bottom:24px;">You're all set! Here's your subscription summary:</p>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;"><strong>Topics:</strong> ${keywords.join(', ')}</p>
              <p style="margin:0 0 8px;"><strong>Daily digest time:</strong> ${pushTime} (${timezone})</p>
              <p style="margin:0;"><strong>Delivery:</strong> ${email}</p>
            </div>
            <p style="color:#6b7280;font-size:14px;">Your first digest will arrive tomorrow at ${pushTime}.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
            <p style="color:#9ca3af;font-size:12px;">My AI News · <a href="https://myainews.club">myainews.club</a></p>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      console.error('Resend error:', err)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Store in KV if available
    if (env.SUBSCRIPTIONS) {
      const existing = await env.SUBSCRIPTIONS.get('all')
      const subs = existing ? JSON.parse(existing) : []
      subs.push({ email, keywords, pushTime, timezone, createdAt: new Date().toISOString(), active: true })
      await env.SUBSCRIPTIONS.put('all', JSON.stringify(subs))
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Subscribe error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
