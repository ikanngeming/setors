// api/auth/register.js
// POST /api/auth/register — kirim OTP ke email untuk verifikasi registrasi

import nodemailer from 'nodemailer'
import { db, COLLECTIONS } from '../_lib/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'

function generateOTP(len = 6) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, email, password, phone } = req.body

  if (!username || !email || !password || !phone) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' })
  }

  try {
    // Cek apakah email sudah terdaftar
    const usersRef = db.collection(COLLECTIONS.USERS)
    const emailCheck = await usersRef.where('email', '==', email).limit(1).get()
    if (!emailCheck.empty) {
      return res.status(409).json({ error: 'Email sudah terdaftar.' })
    }

    // Simpan OTP ke Firestore
    const otp = generateOTP()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 menit

    await db.collection(COLLECTIONS.OTP).doc(email).set({
      otp,
      expiresAt,
      username,
      password,
      phone,
      createdAt: FieldValue.serverTimestamp(),
    })

    // Kirim email
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
      <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f7fc;">
        <div style="max-width:560px;margin:40px auto;padding:0 20px;">
          <div style="background:#fff;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,0.08);overflow:hidden;">
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:28px;font-weight:600;">Verifikasi Akun</h1>
              <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">Kode OTP untuk verifikasi Anda</p>
            </div>
            <div style="padding:48px 32px 40px;">
              <p style="color:#4a5568;font-size:15px;margin:0 0 28px;">Gunakan kode OTP berikut untuk melanjutkan pendaftaran:</p>
              <div style="background:#f8fafc;border-radius:20px;padding:32px;text-align:center;border:1px solid #e2e8f0;margin-bottom:28px;">
                <span style="font-size:44px;font-weight:800;letter-spacing:8px;color:#1e293b;font-family:'Courier New',monospace;">${otp}</span>
              </div>
              <div style="background:#fff9e6;border-left:3px solid #f59e0b;padding:12px 16px;border-radius:8px;">
                <span style="color:#92400e;font-size:13px;">Kode kedaluwarsa dalam <strong>5 menit</strong>. Jangan bagikan ke siapapun.</span>
              </div>
            </div>
            <div style="background:#fafcff;padding:20px 32px;text-align:center;border-top:1px solid #eef2f6;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">© 2024 SetorEmail</p>
            </div>
          </div>
        </div>
      </body>
      </html>`,
    })

    return res.status(200).json({ success: true, message: 'OTP berhasil dikirim.' })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Gagal mengirim OTP. Coba lagi.' })
  }
}
