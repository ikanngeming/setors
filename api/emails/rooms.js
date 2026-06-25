// api/emails/rooms.js
// Required env var: EXTERNAL_API_BASE, EXTERNAL_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const response = await fetch(`https://setorangmail.web.id/api/external/rooms`, {
      headers: { 'x-api-key': "sgp_779e55ee97028a6b0ac9892b7c9fa872c9baff5e2d70b139" },
    })
    if (!response.ok) throw new Error(`Upstream error: ${response.status}`)
    const data = await response.json()
    return res.status(200).json({ rooms: data.rooms || [] })
  } catch (err) {
    console.error('Rooms fetch error:', err)
    return res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
}