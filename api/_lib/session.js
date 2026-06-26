// api/_lib/session.js — helper untuk verify session cookie

import { parse } from 'cookie'
import { createHmac } from 'crypto'
import { db, COLLECTIONS } from './firebase.js'

function signSession(userId) {
  const hmac = createHmac('sha256', process.env.SESSION_SECRET)
  hmac.update(String(userId))
  return hmac.digest('hex')
}

// Kembalikan userId jika session valid, null jika tidak
export function getSessionUserId(req) {
  const cookies   = parse(req.headers.cookie || '')
  const userId    = cookies['session_uid']
  const signature = cookies['session_sig']
  if (!userId || !signature) return null
  return signature === signSession(userId) ? userId : null
}

// Kembalikan user data jika login dan isAdmin=true
export async function requireAdmin(req, res) {
  const userId = getSessionUserId(req)
  if (!userId) {
    res.status(401).json({ error: 'Sesi tidak valid. Silakan login ulang.' })
    return null
  }
  const doc = await db.collection(COLLECTIONS.USERS).doc(userId).get()
  if (!doc.exists || !doc.data().isAdmin) {
    res.status(403).json({ error: 'Akses ditolak. Hanya admin.' })
    return null
  }
  return { id: userId, ...doc.data() }
}

export async function requireAuth(req, res) {
  const userId = getSessionUserId(req)
  if (!userId) {
    res.status(401).json({ error: 'Sesi tidak valid. Silakan login ulang.' })
    return null
  }
  const doc = await db.collection(COLLECTIONS.USERS).doc(userId).get()
  if (!doc.exists) {
    res.status(404).json({ error: 'User tidak ditemukan.' })
    return null
  }
  return { id: userId, ...doc.data() }
}
