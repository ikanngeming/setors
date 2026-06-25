// api/auth/profile.js
//
// GET /api/auth/profile — ambil profil user yang sedang login
//
// Environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//   SESSION_SECRET

import { db, COLLECTIONS } from '../_lib/firebase.js'
import { parse } from 'cookie'
import { createHmac } from 'crypto'

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cookies = parse(req.headers.cookie || '')
  const userId = verifySession(cookies)

  if (!userId) {
    return res.status(401).json({ error: 'Sesi tidak valid. Silakan login ulang.' })
  }

  try {
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get()

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User tidak ditemukan.' })
    }

    const user = userDoc.data()
    const { password: _omit, ...safeUser } = user

    return res.status(200).json({ success: true, user: { id: userId, ...safeUser } })
  } catch (err) {
    console.error('Get profile error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
