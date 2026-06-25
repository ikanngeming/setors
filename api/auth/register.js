// api/auth/register.js
//
// POST /api/auth/register — kirim OTP ke email untuk verifikasi registrasi
//
// Environment variables yang dibutuhkan:
//   FIREBASE_PROJECT_ID     — dari Firebase Console → Project Settings → Service Accounts
//   FIREBASE_CLIENT_EMAIL   — dari service account JSON
//   FIREBASE_PRIVATE_KEY    — dari service account JSON (dengan \n)
//   GMAIL_USER              — Gmail pengirim OTP
//   GMAIL_APP_PASS          — Gmail App Password (bukan password biasa)

import nodemailer from 'nodemailer'
import { db, COLLECTIONS } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'

// ─── Generate OTP ────────────────────────────────────────────────────────────
function generateOTP(len = 6) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('')
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, email, password, phone } = req.body

  if (!username || !email || !password || !phone) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' })
  }

  try {
    // 1. Cek apakah email sudah terdaftar di Firestore
    const usersRef = db.collection(COLLECTIONS.USERS)
    const emailCheck = await usersRef.where('email', '==', email).limit(1).get()

    if (!emailCheck.empty) {
      return res.status(409).json({ error: 'Email sudah terdaftar.' })
    }

    // 2. Buat OTP dan simpan ke Firestore (collection: otp_store, doc ID = email)
    const otp = generateOTP()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 menit

    await db.collection(COLLECTIONS.OTP).doc(email).set({
      otp,
      expiresAt,
      username,
      password, // akan di-hash saat verify-otp
      phone,
      createdAt: FieldValue.serverTimestamp(),
    })

    // 3. Kirim email OTP via Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"SetorEmail" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Kode OTP Verifikasi SetorEmail',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifikasi OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fc; line-height: 1.6;">
        <div style="max-width: 560px; margin: 40px auto; padding: 0 20px;">
          <div style="background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.02); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Verifikasi Akun</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Kode OTP untuk verifikasi Anda</p>
            </div>
            <div style="padding: 48px 32px 40px;">
              <p style="color: #1a202c; font-size: 16px; margin: 0 0 8px; font-weight: 500;">Halo,</p>
              <p style="color: #4a5568; font-size: 15px; margin: 0 0 28px; line-height: 1.5;">
                Kami menerima permintaan verifikasi untuk akun Anda. Gunakan kode sekali pakai (OTP) di bawah ini untuk melanjutkan:
              </p>
              <div style="background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; padding: 32px; text-align: center; border: 1px solid #e2e8f0; margin-bottom: 28px;">
                <div style="display: inline-block; background: white; padding: 12px 28px; border-radius: 60px; box-shadow: 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);">
                  <span style="font-size: 44px; font-weight: 800; letter-spacing: 8px; color: #1e293b; font-family: 'Courier New', 'SF Mono', monospace;">${otp}</span>
                </div>
              </div>
              <div style="background: #fff9e6; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 12px; margin-bottom: 24px;">
                <span style="color: #92400e; font-size: 13px; font-weight: 500;">Kode OTP ini akan kedaluwarsa dalam <strong>5 menit</strong></span>
              </div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 8px;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 12px;">✓ Jangan bagikan kode ini kepada siapa pun</p>
                <p style="color: #64748b; font-size: 13px; margin: 0;">✓ Jika Anda tidak meminta kode ini, abaikan email ini</p>
              </div>
            </div>
            <div style="background-color: #fafcff; padding: 20px 32px; text-align: center; border-top: 1px solid #eef2f6;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px;">© 2024 Sistem Verifikasi. Semua hak dilindungi.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
      `,
    })

    return res.status(200).json({ success: true, message: 'OTP berhasil dikirim.' })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Gagal mengirim OTP. Coba lagi.' })
  }
}
