// api/auth/update-profile.js — POST /api/auth/update-profile
import { db, COLLECTIONS } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAuth } from '../_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await requireAuth(req, res)
  if (!user) return

  const { username, phone, dana } = req.body
  if (!username && !phone && dana === undefined) {
    return res.status(400).json({ error: 'Tidak ada data yang diubah.' })
  }

  try {
    const updates = { updatedAt: FieldValue.serverTimestamp() }
    if (username) updates.username = username.trim()
    if (phone)    updates.phone    = phone.trim()
    if (dana)     updates.dana     = dana

    await db.collection(COLLECTIONS.USERS).doc(user.id).update(updates)
    const doc = await db.collection(COLLECTIONS.USERS).doc(user.id).get()
    const { password: _omit, ...safe } = doc.data()
    return res.status(200).json({ success: true, user: { id: user.id, ...safe } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
