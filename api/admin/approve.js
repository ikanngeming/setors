// api/admin/approve.js
//
// POST /api/admin/approve — approve deposit, update saldo user
//
// Environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//   ADMIN_SECRET — secret key untuk autentikasi admin

import { db, COLLECTIONS } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Auth admin via secret header
  const secret = req.headers['x-admin-secret']
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized.' })
  }

  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email wajib diisi.' })
  }

  try {
    // Cari user yang memiliki riwayat deposit dengan email tersebut
    // Menggunakan array-contains tidak bisa langsung untuk nested field,
    // jadi kita ambil semua users dan filter di memory
    // (untuk scale besar, gunakan subcollection riwayat terpisah)
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get()

    let targetUserId = null
    let targetUser = null
    let targetRiwayatIndex = -1

    for (const doc of usersSnapshot.docs) {
      const user = doc.data()
      const riwayat = user.riwayat || []
      const idx = riwayat.findIndex((r) => r.email === email && r.status === 'pending')

      if (idx !== -1) {
        targetUserId = doc.id
        targetUser = user
        targetRiwayatIndex = idx
        break
      }
    }

    if (!targetUserId) {
      return res.status(404).json({ error: 'Email tidak ditemukan atau sudah diproses.' })
    }

    // Update riwayat dan saldo secara atomik dengan Firestore transaction
    const userRef = db.collection(COLLECTIONS.USERS).doc(targetUserId)

    await db.runTransaction(async (t) => {
      const freshDoc = await t.get(userRef)
      const freshUser = freshDoc.data()
      const riwayat = [...(freshUser.riwayat || [])]

      // Cari ulang di dalam transaction untuk hindari race condition
      const idx = riwayat.findIndex((r) => r.email === email && r.status === 'pending')
      if (idx === -1) throw new Error('Riwayat tidak ditemukan dalam transaction.')

      const entry = riwayat[idx]
      riwayat[idx] = {
        ...entry,
        status: 'accepted',
        acceptedAt: new Date().toLocaleString('id-ID'),
      }

      const tambahan = Number(entry.saldo || 0)

      t.update(userRef, {
        riwayat,
        saldo: FieldValue.increment(tambahan),
        diterima: FieldValue.increment(1),
        pending: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Approve error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
