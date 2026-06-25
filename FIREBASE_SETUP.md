# Panduan Setup Firebase untuk SetorEmail

## 1. Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik **Add project** → beri nama project
3. Nonaktifkan Google Analytics (opsional) → **Create project**

## 2. Aktifkan Firestore Database

1. Di sidebar, klik **Build → Firestore Database**
2. Klik **Create database**
3. Pilih mode **Production** → pilih region terdekat (misalnya `asia-southeast1`)
4. Klik **Enable**

## 3. Atur Firestore Security Rules

Di tab **Rules**, ganti dengan rules berikut agar data hanya bisa diakses dari server (Admin SDK):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Semua akses diblokir dari client — hanya Admin SDK yang bisa akses
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Klik **Publish**.

## 4. Buat Service Account (Admin SDK)

1. Klik ⚙️ **Project Settings** (gear icon di sidebar)
2. Tab **Service accounts**
3. Klik **Generate new private key** → **Generate key**
4. Download file JSON (simpan aman, jangan di-commit ke Git!)

## 5. Isi Environment Variables

Dari file JSON yang didownload, ambil nilai berikut:

| Field di JSON       | Environment Variable    |
|---------------------|-------------------------|
| `project_id`        | `FIREBASE_PROJECT_ID`   |
| `client_email`      | `FIREBASE_CLIENT_EMAIL` |
| `private_key`       | `FIREBASE_PRIVATE_KEY`  |

### Di `.env.local` (development):
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"
```

### Di Vercel Dashboard (production):
1. **Settings → Environment Variables**
2. Tambahkan masing-masing variabel
3. Untuk `FIREBASE_PRIVATE_KEY`: paste nilai `private_key` dari JSON **apa adanya** (Vercel otomatis handle newline)

## 6. Struktur Koleksi Firestore

Setelah setup, Firestore akan memiliki struktur berikut:

```
firestore/
├── users/                    ← koleksi user
│   └── {userId}/             ← auto-generated document ID
│       ├── username: string
│       ├── email: string
│       ├── password: string  ← hashed (salt:hash)
│       ├── phone: string
│       ├── saldo: number
│       ├── pending: number
│       ├── diterima: number
│       ├── dana: array
│       ├── riwayat: array
│       ├── isAdmin: boolean
│       └── createdAt: timestamp
│
└── otp_store/               ← koleksi OTP sementara
    └── {email}/             ← document ID = email user
        ├── otp: string
        ├── expiresAt: number (unix ms)
        ├── username: string
        ├── password: string  ← plain, di-hash saat verify
        ├── phone: string
        └── createdAt: timestamp
```

## 7. (Opsional) Bersihkan OTP Expired Otomatis

Agar dokumen OTP yang expired otomatis dihapus, aktifkan **TTL Policy** di Firestore:

1. Firestore Console → **Indexes** → tab **Single field**
2. Klik **Add exemption** → Collection: `otp_store`, Field: `expiresAt`
3. Centang **Enable TTL** → Save

Atau buat **Cloud Function** scheduled untuk membersihkan OTP expired setiap jam.

## 8. Instal Dependency

```bash
npm install
# atau
pnpm install
```

`firebase-admin` sudah ditambahkan ke `package.json`. `@vercel/blob` sudah dihapus.
