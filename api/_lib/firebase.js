// api/_lib/firebase.js — Firebase Admin SDK singleton

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0]

  const projectId   = "setor-2bba1"
  const clientEmail = "firebase-adminsdk-fbsvc@setor-2bba1.iam.gserviceaccount.com"
  const privateKey  = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDD/zLCWg4iwbDK\nB74XC0GS/7ViBsJjdtyi5IsHvATL2HzjYgYQnZGGKEXliaE1WVmjrSqCBHC2AWdI\nyOJVOzImYU//OexIVbY/CGoCAFVR/Z2j9cFdg9qVfsNBfMc9TAJkYmDxbA0AQ7XT\nClDgOdECDsOQx8yv01hSNvhYVvC1pXhZaXa1BG9FdueGyr5etYhbNyTFN7mcwiVG\nL9M4fCfva+otXL6048TKA2j+LJ4Fvl0CTH/JiDR+rivrrwIwmL/iol8CcgEc+Y7W\nqoIk1TXL+/6KOWHHr2RGIpzlMXXOpmVNaoWF+lcOc+XuoT9mCKXXQ6r51nRopXwF\nUo3CyxIxAgMBAAECggEACYy6czOnGfST5mL653atcJ6BrHjX+7evHpBvvOYYR7s+\njoxGFBdRVoS3HNqqgxgmoOTGKc4JJwGpyQKYJSOzT8XZ6TRwFTAvXf2WUdft4pku\nqYCQI7wbA8Ha6qq501fVHbhP+jEdFDKT0Hqqskflv85GNYo1hAWksD6H2nxV9pTb\n3xJgoEGGlrBALkPM5AXNoCAO43PBqBn+QNTTssiFJAyh2aV4JC56UDGgABvqBtRm\nl8fXMkVdP2JpHcrKzeyMQSb+kkpZN10y9EM74ERUazPlehwDnVrapTEykc8T8Mvk\npQ76836GUkhEbfBchfwMWAojH6ziAuVlmXaCNU4pNwKBgQDyI0hAAr/wDpRzTE7L\niyFlSDkRxuEEocffMcofqw0qUJVJQXlTVxAd6SbZnW/C61CMGBf652Y3zZ/x4hKa\nx+rhTwCvmUnKqaWpqq4FVYbPjWv3DagQC8qwsWGJdYgXjVQbpjVSJ6qEcDD4+lnr\nXSy2CJHiCaZKGE7UQyNznlcw4wKBgQDPN68/YlTl/4F26ys+tcqZxBFL9Y3fU8bc\nr/dp6FE/fGr35R9rtxYlx4ncT5Ub+zbcKgmJ0Pi1oS5BKvmH5RA2V0/0890DQCnD\nZQpxdEeU3coRwmQFvkimi0RDvPNp74nYMY3VY2eP5duKddU7cMPh36nUSqXkNKiY\nWq57+G7A2wKBgDrllBxlztQQZ9GHvR7Lb8sX/zGww2kCBQDoNnbvf1tMkJNqBp3b\n7oKoBJgoMFgkLsp0zdhs0rM+I+qNB+N4P0ygj9UmnwlZrH8RkhSgEhOIHbvRKZEF\nnT7PVp895GV+LfgvvIaIOXTPaUoWcyrJ1idM/FcT68vYD8yXrBbia+jrAoGBAMRW\nbqYP9YE3ZuPWT1NLzHuFWx4tvA8uwe24jSS8Cr+sk23umqblAwco2Wb1wMKSdJiG\n/CKo7f6qibkVjvlEAOh8MjZWGcNKuEd7JTn6gxh6TUwmc789XHjw2+2SytBFNsax\nrUHSvf2KPUoj+7YmUnNiCPgtAqIHgvdYdJrh+Y6hAoGAGPaSQ9+HWwI/MGTSpq40\npSXHF8oNVy102uboYP/1cdXrnYY5D3cdzIR5QHQ2Ssefouc7C1G5w0Msxlm4UZnx\nyOsrP5c81oD4LxMkoAY7+l+IxV8NxWJKCQ73sSgrQX9xtEP4LoaDT02PZOL1qwDH\nLwaSVXv0+NVE4oOtfwtxI+c=\n-----END PRIVATE KEY-----\n"?.replace(/\\n/g, '\n')

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
