// api/_lib/firebase.js
//
// Shared Firebase Admin SDK instance (singleton pattern).
//
// Environment variables yang dibutuhkan di Vercel Dashboard:
//   FIREBASE_PROJECT_ID       — project ID dari Firebase console
//   FIREBASE_CLIENT_EMAIL     — service account email
//   FIREBASE_PRIVATE_KEY      — private key (dengan \n sebagai newline)
//
// Cara setup:
//   1. Buka Firebase Console → Project Settings → Service Accounts
//   2. Klik "Generate new private key" → download JSON
//   3. Salin nilai dari JSON ke env vars masing-masing:
//      - project_id        → FIREBASE_PROJECT_ID
//      - client_email      → FIREBASE_CLIENT_EMAIL
//      - private_key       → FIREBASE_PRIVATE_KEY
//   4. Pastikan FIREBASE_PRIVATE_KEY disimpan dengan \n (bukan newline asli)
//      di Vercel, atau gunakan tanda kutip ganda di .env.local

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel menyimpan \n sebagai literal string — replace agar jadi newline asli
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

// db adalah Firestore instance yang bisa dipakai di semua handler
export const db = getFirestore(getFirebaseApp())

// ─── Koleksi ─────────────────────────────────────────────────────────────────
// Agar nama koleksi konsisten di seluruh codebase
export const COLLECTIONS = {
  USERS: 'users',
  OTP: 'otp_store',
}
