// api/auth/change-password.js
//
// POST /api/auth/change-password — ganti password user
//
// Environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//   SESSION_SECRET

import { db, COLLECTIONS } from '../_lib/firebase.js'
import { parse } from 'cookie'
import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'crypto'
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

// ─── Password Helpers ─────────────────────────────────────────────────────────

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

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

  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Password lama dan baru wajib diisi.' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password baru minimal 8 karakter.' })
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'Password baru tidak boleh sama dengan password lama.' })
  }

  try {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User tidak ditemukan.' })
    }

    const user = userDoc.data()

    const isValid = verifyPassword(currentPassword, user.password || '')
    if (!isValid) {
      return res.status(401).json({ error: 'Password lama tidak sesuai.' })
    }

    // Update password di Firestore
    await userRef.update({
      password: hashPassword(newPassword),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return res.status(200).json({ success: true, message: 'Password berhasil diperbarui.' })
  } catch (err) {
    console.error('Change password error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
