// api/auth/delete-account.js — POST /api/auth/delete-account
import { db, COLLECTIONS } from '../_lib/firebase.js'
import { requireAuth } from '../_lib/session.js'
import { serialize } from 'cookie'
import { scryptSync, timingSafeEqual } from 'crypto'

function verifyPassword(pw, stored) {
  if (!stored.includes(':')) return stored === pw
  const [salt, hash] = stored.split(':')
  return timingSafeEqual(scryptSync(pw, salt, 64), Buffer.from(hash, 'hex'))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await requireAuth(req, res)
  if (!user) return

  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Masukkan password untuk konfirmasi.' })
  if (!verifyPassword(password, user.password || '')) return res.status(401).json({ error: 'Password salah.' })

  try {
    await db.collection(COLLECTIONS.USERS).doc(user.id).delete()
    const opts = { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 }
    res.setHeader('Set-Cookie', [
      serialize('session_uid', '', opts),
      serialize('session_sig', '', opts),
    ])
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
