// api/auth/change-password.js — POST /api/auth/change-password
import { db, COLLECTIONS } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAuth } from '../_lib/session.js'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

function hashPassword(pw) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(pw, salt, 64).toString('hex')}`
}
function verifyPassword(pw, stored) {
  if (!stored.includes(':')) return stored === pw
  const [salt, hash] = stored.split(':')
  return timingSafeEqual(scryptSync(pw, salt, 64), Buffer.from(hash, 'hex'))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await requireAuth(req, res)
  if (!user) return

  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Password lama dan baru wajib diisi.' })
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password baru minimal 8 karakter.' })
  if (!verifyPassword(currentPassword, user.password || '')) return res.status(401).json({ error: 'Password lama tidak sesuai.' })

  try {
    await db.collection(COLLECTIONS.USERS).doc(user.id).update({
      password: hashPassword(newPassword),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return res.status(200).json({ success: true, message: 'Password berhasil diperbarui.' })
  } catch (err) {
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
