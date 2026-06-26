// api/admin/broadcast.js — POST /api/admin/broadcast
import { db } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin } from '../_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const admin = await requireAdmin(req, res)
  if (!admin) return

  const { message } = req.body
  if (!message?.trim()) return res.status(400).json({ error: 'Pesan tidak boleh kosong.' })

  try {
    await db.collection('broadcasts').add({
      message: message.trim(),
      createdAt: FieldValue.serverTimestamp(),
    })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Broadcast error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
