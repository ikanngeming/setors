// api/admin/users.js — GET /api/admin/users?page=0
import { db, COLLECTIONS } from '../_lib/firebase.js'
import { requireAdmin } from '../_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const page     = Math.max(0, parseInt(req.query.page || '0'))
    const pageSize = 20

    const countSnap = await db.collection(COLLECTIONS.USERS).count().get()
    const total     = countSnap.data().count
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    const snapshot = await db.collection(COLLECTIONS.USERS)
      .orderBy('createdAt', 'desc')
      .limit(pageSize)
      .offset(page * pageSize)
      .get()

    const users = snapshot.docs.map(doc => {
      const { password: _omit, ...safe } = doc.data()
      return { id: doc.id, ...safe }
    })

    return res.status(200).json({ users, totalPages, total })
  } catch (err) {
    console.error('Admin users error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
