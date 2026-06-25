// api/auth/delete-account.js
//
// POST /api/auth/delete-account — hapus akun user yang sedang login
//
// Environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//   SESSION_SECRET

import { db, COLLECTIONS } from '../_lib/firebase.js'
import { parse, serialize } from 'cookie'
import { createHmac, scryptSync, timingSafeEqual } from 'crypto'

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

function clearSessionCookies(res) {
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }
  res.setHeader('Set-Cookie', [
    serialize('session_uid', '', opts),
    serialize('session_sig', '', opts),
  ])
}

// ─── Password Verifier ────────────────────────────────────────────────────────

function verifyPassword(password, stored) {
  if (!stored.includes(':')) return stored === password
  const [salt, hash] = stored.split(':')
  const inputHash = scryptSync(password, salt, 64)
  const storedHash = Buffer.from(hash, 'hex')
  return timingSafeEqual(inputHash, storedHash)
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

  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: 'Masukkan password untuk konfirmasi penghapusan akun.' })
  }

  try {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User tidak ditemukan.' })
    }

    const user = userDoc.data()

    const isValid = verifyPassword(password, user.password || '')
    if (!isValid) {
      return res.status(401).json({ error: 'Password salah. Penghapusan akun dibatalkan.' })
    }

    // Hapus dokumen user dari Firestore
    await userRef.delete()

    // Hapus session cookie
    clearSessionCookies(res)

    return res.status(200).json({ success: true, message: 'Akun berhasil dihapus.' })
  } catch (err) {
    console.error('Delete account error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
