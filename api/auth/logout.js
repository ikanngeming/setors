// api/auth/logout.js
//
// POST /api/auth/logout — hapus session cookie

import { serialize } from 'cookie'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }

  res.setHeader('Set-Cookie', [
    serialize('session_uid', '', cookieOpts),
    serialize('session_sig', '', cookieOpts),
  ])

  return res.status(200).json({ success: true, message: 'Logout berhasil.' })
}
