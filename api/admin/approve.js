// api/admin/approve.js — POST /api/admin/approve
import { db, COLLECTIONS } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin } from '../_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const admin = await requireAdmin(req, res)
  if (!admin) return

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email wajib diisi.' })

  try {
    const snapshot = await db.collection(COLLECTIONS.USERS).get()
    let targetId = null

    for (const doc of snapshot.docs) {
      const riwayat = doc.data().riwayat || []
      const idx = riwayat.findIndex(r => r.email === email && r.status === 'pending')
      if (idx !== -1) { targetId = doc.id; break }
    }

    if (!targetId) return res.status(404).json({ error: 'Email tidak ditemukan atau sudah diproses.' })

    const userRef = db.collection(COLLECTIONS.USERS).doc(targetId)
    await db.runTransaction(async (t) => {
      const freshDoc = await t.get(userRef)
      const riwayat  = [...(freshDoc.data().riwayat || [])]
      const idx      = riwayat.findIndex(r => r.email === email && r.status === 'pending')
      if (idx === -1) throw new Error('Race condition')
      const entry    = riwayat[idx]
      riwayat[idx]   = { ...entry, status: 'accepted', acceptedAt: new Date().toLocaleString('id-ID') }
      t.update(userRef, {
        riwayat,
        saldo:    FieldValue.increment(Number(entry.saldo || 0)),
        diterima: FieldValue.increment(1),
        pending:  FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Approve error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
