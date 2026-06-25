// api/auth/update-profile.js
//
// POST /api/auth/update-profile — update username, phone, dan dana user
//
// Environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//   SESSION_SECRET

import { db, COLLECTIONS } from '../_lib/firebase.js'
import { parse } from 'cookie'
import { createHmac } from 'crypto'
import { FieldValue } from 'firebase-admin/firestore'

// ─── Session Helpers ─────────────────────────────────────────────────────────

function signSession(userId) {
  const hmac = createHmac('sha256', process.env.SESSION_SECRET)
  hmac.update(String(userId))
  return hmac.digest('hex')
}

function verifySession(cookies) {
  const userId = cookies['session_uid']
  const signature = cookies['session_sig']
  if (!userId || !signature) return null
  return signature === signSession(userId) ? userId : null
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cookies = parse(req.headers.cookie || '')
  const userId = verifySession(cookies)

  if (!userId) {
    return res.status(401).json({ error: 'Sesi tidak valid. Silakan login ulang.' })
  }

  const { username, phone, dana } = req.body

  if (!username && !phone && !dana) {
    return res.status(400).json({ error: 'Tidak ada data yang diubah.' })
  }

  if (dana !== undefined) {
    if (!Array.isArray(dana)) {
      return res.status(400).json({ error: 'Field dana harus berupa array.' })
    }
    for (const item of dana) {
      if (!item.nomor || !item.nama) {
        return res.status(400).json({ error: 'Setiap item dana harus memiliki nomor dan nama.' })
      }
    }
  }

  try {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User tidak ditemukan.' })
    }

    // Bangun object update — hanya field yang dikirim
    const updates = { updatedAt: FieldValue.serverTimestamp() }
    if (username) updates.username = username.trim()
    if (phone) updates.phone = phone.trim()
    if (dana) updates.dana = dana

    await userRef.update(updates)

    // Ambil data terbaru
    const updatedDoc = await userRef.get()
    const { password: _omit, ...safeUser } = updatedDoc.data()

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      user: { id: userId, ...safeUser },
    })
  } catch (err) {
    console.error('Update profile error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
