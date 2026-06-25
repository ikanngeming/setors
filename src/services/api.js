import axios from 'axios'

// All sensitive values must be set as Vercel Environment Variables
// In Vercel dashboard: Settings → Environment Variables
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // ✅ Wajib agar session cookie dikirim di setiap request
})

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  // Daftar akun baru → kirim OTP ke email
  register: (data) => api.post('/auth/register', data),
  
  // Verifikasi OTP → akun dibuat, session dimulai
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  
  // Login → set session cookie
  login: (data) => api.post('/auth/login', data),
  
  // Logout → hapus session cookie
  logout: () => api.post('/auth/logout'),
}

// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  // Ambil profil user yang sedang login
  getProfile: () => api.get('/user/profile'),
  
  // Update username, phone, atau dana
  updateProfile: (data) => api.post('/user/update-profile', data),
  
  // Ganti password (butuh currentPassword & newPassword)
  changePassword: (data) => api.post('/user/change-password', data),
  
  // Hapus akun (butuh konfirmasi password)
  deleteAccount: (data) => api.post('/user/delete-account', data),
  
  // Riwayat transaksi user
  getHistory: () => api.get('/user/history'),
  
  // Tambah akun DANA
  addDana: (data) => api.post('/user/dana', data),
}

// ─── Email API ────────────────────────────────────────────────────────────────
export const emailAPI = {
  generate: (count) => api.post('/emails/generate', { count }),
  getRooms: () => api.get('/emails/rooms'),
  deposit: (data) => api.post('/emails/deposit', data),
  getStatus: (email) => api.get(`/emails/status?email=${encodeURIComponent(email)}`),
}

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: (page) => api.get(`/admin/users?page=${page}`),
  checkEmail: (email) => api.get(`/admin/check-email?email=${encodeURIComponent(email)}`),
  approveEmail: (email) => api.post('/admin/approve', { email }),
  broadcast: (message, photo) => api.post('/admin/broadcast', { message, photo }),
}

export default api