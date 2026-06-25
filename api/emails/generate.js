// api/emails/generate.js
// Required env vars: EXTERNAL_API_BASE, EXTERNAL_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { count } = req.body
  try {
    const response = await fetch(`https://setorangmail.web.id/api/external/generate-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': "sgp_779e55ee97028a6b0ac9892b7c9fa872c9baff5e2d70b139",
      },
      body: JSON.stringify({ count: parseInt(count) }),
    })

    if (!response.ok) throw new Error(`Upstream error: ${response.status}`)
    const data = await response.json()
    return res.status(200).json({ emails: data.emails || [] })
  } catch (err) {
    console.error('Generate emails error:', err)
    return res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
}
