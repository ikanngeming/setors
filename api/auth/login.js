// api/auth/login.js
//
// POST /api/auth/login — login user dan set session cookie
//
// Environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//   SESSION_SECRET — string acak panjang untuk signing cookie

import { db, COLLECTIONS } from '../_lib/firebase.js'
import { serialize } from 'cookie'
import { createHmac, scryptSync, timingSafeEqual } from 'crypto'

// ─── Session Helpers ─────────────────────────────────────────────────────────

function signSession(userId) {
  const hmac = createHmac('sha256', process.env.SESSION_SECRET)
  hmac.update(String(userId))
  return hmac.digest('hex')
}

// ─── Password Helpers ─────────────────────────────────────────────────────────

function verifyPassword(password, stored) {
  // Support password lama yang tersimpan sebagai plaintext (migrasi bertahap)
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

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' })
  }

  try {
    // Cari user berdasarkan email di Firestore
    const usersRef = db.collection(COLLECTIONS.USERS)
    const snapshot = await usersRef.where('email', '==', email).limit(1).get()

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Email atau password salah.' })
    }

    const userDoc = snapshot.docs[0]
    const userId = userDoc.id
    const user = userDoc.data()

    const isValid = verifyPassword(password, user.password || '')
    if (!isValid) {
      return res.status(401).json({ error: 'Email atau password salah.' })
    }

    // Set session cookie (httpOnly, secure, 7 hari)
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    }

    res.setHeader('Set-Cookie', [
      serialize('session_uid', String(userId), cookieOpts),
      serialize('session_sig', signSession(userId), cookieOpts),
    ])

    const { password: _omit, ...safeUser } = user

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      user: { id: userId, ...safeUser },
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
