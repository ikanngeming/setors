# SetorEmail — Platform Setor Gmail

Website profesional berbasis React + Vercel yang menggantikan bot Telegram.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Vercel Serverless Functions (Node.js)
- **Styling:** Pure CSS dengan CSS Variables (no Tailwind needed)
- **Auth:** OTP via Gmail SMTP
- **Deploy:** Vercel (gratis)

---

## 🚀 Cara Deploy ke Vercel

### 1. Persiapan

```bash
# Clone / upload project ke GitHub dulu
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/setor-email.git
git push -u origin main
```

### 2. Install & Test Lokal

```bash
npm install
cp .env.example .env.local
# Isi .env.local dengan nilai yang benar
npm run dev
```

### 3. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → **New Project**
2. Import repo GitHub kamu
3. Framework preset: **Vite** (otomatis terdeteksi)
4. Klik **Environment Variables** dan isi semua variabel:

| Nama | Nilai |
|------|-------|
| `EXTERNAL_API_BASE` | URL backend kamu (contoh: `https://setorangmail.web.id`) |
| `EXTERNAL_API_KEY` | API key backend |
| `GMAIL_USER` | Email Gmail pengirim OTP |
| `GMAIL_APP_PASS` | Gmail App Password (bukan password biasa!) |
| `ADMIN_SECRET` | String acak minimal 32 karakter |
| `VITE_API_BASE_URL` | `/api` |

5. Klik **Deploy** ✅

---

## 🔑 Cara Buat Gmail App Password

1. Buka [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → aktifkan dulu
3. Security → App Passwords
4. Pilih app: **Mail**, device: **Other** → ketik "SetorEmail"
5. Salin 16-digit password yang muncul → masukkan ke `GMAIL_APP_PASS`

---

## 📁 Struktur Project

```
setor-email/
├── api/                      # Vercel Serverless Functions
│   ├── auth/
│   │   ├── register.js       # Register + kirim OTP
│   │   └── verify-otp.js     # Verifikasi OTP + buat akun
│   ├── emails/
│   │   ├── generate.js       # Generate email via API eksternal
│   │   ├── rooms.js          # Ambil daftar room
│   │   └── deposit.js        # Submit setoran email
│   └── admin/
│       └── approve.js        # Admin approve email
│
├── src/
│   ├── components/
│   │   ├── UI.jsx            # Komponen reusable (Card, Button, Input, dst)
│   │   ├── Sidebar.jsx       # Navigasi desktop
│   │   └── MobileNav.jsx     # Navigasi mobile (bottom bar)
│   ├── context/
│   │   └── AuthContext.jsx   # State management user
│   ├── pages/
│   │   ├── AuthPage.jsx      # Login / Register / OTP
│   │   ├── Dashboard.jsx     # Halaman utama
│   │   ├── GeneratePage.jsx  # Generate email
│   │   ├── SetorPage.jsx     # Setor email (wizard 3 langkah)
│   │   ├── RiwayatPage.jsx   # Riwayat setoran + filter
│   │   ├── SettingsPage.jsx  # Profil + akun Dana
│   │   └── AdminPage.jsx     # Panel admin (user, cek email, broadcast, stats)
│   ├── services/
│   │   └── api.js            # Axios API client
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env.example              # Template env vars (JANGAN commit .env.local)
├── vercel.json               # Config routing Vercel
├── vite.config.js
└── package.json
```

---

## 🔒 Keamanan (Penting!)

- ✅ Semua credentials ada di **environment variables**, tidak di kode
- ✅ API routes di backend Vercel, API key tidak terekspos ke browser
- ✅ Admin routes dilindungi `x-admin-secret` header
- ✅ File `.env.local` ada di `.gitignore`
- ⚠️ Untuk production serius: gunakan **Vercel KV** atau **Supabase** sebagai database persistent, bukan in-memory store

---

## 🗄️ Upgrade ke Database Persistent

State in-memory (`global._usersStore`) akan reset setiap cold start Vercel.
Untuk production, ganti dengan:

```bash
# Pilihan 1: Vercel KV (Redis)
npm install @vercel/kv

# Pilihan 2: Supabase (PostgreSQL)
npm install @supabase/supabase-js

# Pilihan 3: PlanetScale (MySQL)
npm install @planetscale/database
```

---

## 📱 Fitur

| Fitur | Status |
|-------|--------|
| Login / Register + OTP Email | ✅ |
| Dashboard statistik | ✅ |
| Generate email (via API eksternal) | ✅ |
| Setor email (wizard 3 langkah) | ✅ |
| Riwayat setoran + filter + search | ✅ |
| Pengaturan profil + akun Dana | ✅ |
| Panel admin (user list, cek email, approve, broadcast, stats) | ✅ |
| Responsive mobile + desktop | ✅ |
| Dark mode (by default) | ✅ |
