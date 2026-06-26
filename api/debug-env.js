// api/debug-env.js — HAPUS FILE INI SETELAH SELESAI DEBUG
// GET /api/debug-env

export default function handler(req, res) {
  return res.status(200).json({
    FIREBASE_PROJECT_ID:    process.env.FIREBASE_PROJECT_ID    ? `✅ ada (${process.env.FIREBASE_PROJECT_ID})` : '❌ KOSONG',
    FIREBASE_CLIENT_EMAIL:  process.env.FIREBASE_CLIENT_EMAIL  ? `✅ ada` : '❌ KOSONG',
    FIREBASE_PRIVATE_KEY:   process.env.FIREBASE_PRIVATE_KEY   ? `✅ ada (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : '❌ KOSONG',
    SESSION_SECRET:         process.env.SESSION_SECRET         ? '✅ ada' : '❌ KOSONG',
    NODE_ENV:               process.env.NODE_ENV,
  })
}
