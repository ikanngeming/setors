// api/_lib/firebase.js — Firebase Admin SDK singleton

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0]

  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  // Log untuk debug di Vercel Functions logs
  console.log('[Firebase] projectId:', projectId || 'MISSING')
  console.log('[Firebase] clientEmail:', clientEmail || 'MISSING')
  console.log('[Firebase] privateKey length:', privateKey?.length || 0)

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Firebase env vars missing: projectId=${!!projectId} clientEmail=${!!clientEmail} privateKey=${!!privateKey}`
    )
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
}

export const db = getFirestore(getFirebaseApp())

export const COLLECTIONS = {
  USERS: 'users',
  OTP:   'otp_store',
}
