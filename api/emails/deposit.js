// api/emails/deposit.js
//
// POST /api/emails/deposit — kirim deposit ke external API dan catat riwayat
//
// Environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//   EXTERNAL_API_KEY — API key untuk setorangmail

import { db, COLLECTIONS } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { roomId, listText, userId } = req.body

  if (!roomId || !listText) {
    return res.status(400).json({ error: 'roomId dan listText wajib diisi.' })
  }

  try {
    // 1. Kirim ke external API
    const response = await fetch('https://setorangmail.web.id/api/external/deposit', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.EXTERNAL_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId,
        listText,
        withdrawalBank: 'DANA',
        withdrawalAccount: '085765183832',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || data.message || 'Deposit gagal',
      })
    }

    // 2. Catat riwayat deposit ke Firestore (jika userId dikirim)
    if (userId) {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId)
      const userDoc = await userRef.get()

      if (userDoc.exists) {
        const entryRiwayat = {
          type: 'deposit',
          roomId,
          listText,
          email: data?.email || null,
          saldo: data?.saldo || 0,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }

        // Gunakan FieldValue.arrayUnion agar atomic dan tidak overwrite
        await userRef.update({
          riwayat: FieldValue.arrayUnion(entryRiwayat),
          pending: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    }

    return res.status(200).json({ success: true, data })
  } catch (err) {
    console.error('Deposit error:', err)
    return res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
}
