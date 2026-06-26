// api/auth/profile.js — GET /api/auth/profile
import { requireAuth } from '../_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await requireAuth(req, res)
  if (!user) return
  const { password: _omit, ...safe } = user
  return res.status(200).json({ success: true, user: safe })
}
