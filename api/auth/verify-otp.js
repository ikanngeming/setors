// api/auth/verify-otp.js
//
// POST /api/auth/verify-otp — verifikasi OTP dan buat akun user di Firestore
//
// Environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

import { db, COLLECTIONS } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'
import { scryptSync, randomBytes } from 'crypto'

// ─── Hash password ────────────────────────────────────────────────────────────
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email dan OTP wajib diisi.' })
  }

  try {
    // 1. Ambil dokumen OTP dari Firestore
    const otpRef = db.collection(COLLECTIONS.OTP).doc(email)
    const otpDoc = await otpRef.get()

    if (!otpDoc.exists) {
      return res.status(400).json({ error: 'OTP tidak ditemukan. Silakan daftar ulang.' })
    }

    const record = otpDoc.data()

    // 2. Cek kedaluwarsa
    if (Date.now() > record.expiresAt) {
      await otpRef.delete() // bersihkan OTP expired
      return res.status(400).json({ error: 'OTP sudah kedaluwarsa.' })
    }

    // 3. Validasi kode OTP
    if (record.otp !== String(otp)) {
      return res.status(400).json({ error: 'Kode OTP salah.' })
    }

    // 4. Cek duplikat email di koleksi users
    const usersRef = db.collection(COLLECTIONS.USERS)
    const emailCheck = await usersRef.where('email', '==', email).limit(1).get()

    if (!emailCheck.empty) {
      await otpRef.delete()
      return res.status(409).json({ error: 'Email sudah terdaftar.' })
    }

    // 5. Buat dokumen user baru di Firestore
    //    Gunakan .add() agar Firestore generate ID otomatis
    const newUser = {
      username: record.username,
      email,
      password: hashPassword(record.password),
      phone: record.phone,
      saldo: 0,
      pending: 0,
      diterima: 0,
      dana: [{ nomor: record.phone, nama: record.username }],
      riwayat: [],
      isAdmin: false,
      createdAt: FieldValue.serverTimestamp(),
    }

    const userDocRef = await usersRef.add(newUser)
    const userId = userDocRef.id

    // 6. Hapus OTP yang sudah dipakai
    await otpRef.delete()

    // 7. Kembalikan data user (tanpa password)
    const { password: _omit, ...safeUser } = newUser

    return res.status(200).json({
      success: true,
      user: {
        id: userId,
        ...safeUser,
        createdAt: new Date().toISOString(),
        token: `demo_token_${userId}`,
      },
    })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
}
