// api/admin/check-email.js — GET /api/admin/check-email?email=xxx
import { db, COLLECTIONS } from '../_lib/firebase.js'
import { requireAdmin } from '../_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const admin = await requireAdmin(req, res)
  if (!admin) return

  const { email } = req.query
  if (!email) return res.status(400).json({ error: 'Email wajib diisi.' })

  try {
    const snapshot = await db.collection(COLLECTIONS.USERS).get()
    for (const doc of snapshot.docs) {
      const user    = doc.data()
      const riwayat = user.riwayat || []
      const found   = riwayat.find(r => r.email === email)
      if (found) {
        const { password: _omit, ...safeUser } = user
        return res.status(200).json({ found: true, user: { id: doc.id, ...safeUser }, riwayat: found })
      }
    }
    return res.status(200).json({ found: false })
  } catch (err) {
    console.error('Check email error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
