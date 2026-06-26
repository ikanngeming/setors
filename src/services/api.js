import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // wajib agar session cookie ikut di setiap request
})

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:  (data)       => api.post('/auth/register', data),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  login:     (data)       => api.post('/auth/login', data),
  logout:    ()           => api.post('/auth/logout'),
  getProfile: ()          => api.get('/auth/profile'),
}

// ─── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:     ()     => api.get('/auth/profile'),
  updateProfile:  (data) => api.post('/auth/update-profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  deleteAccount:  (data) => api.post('/auth/delete-account', data),
}

// ─── Email ────────────────────────────────────────────────────────────────────
export const emailAPI = {
  generate: (count) => api.post('/emails/generate', { count }),
  getRooms: ()      => api.get('/emails/rooms'),
  deposit:  (data)  => api.post('/emails/deposit', data),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers:     (page)  => api.get(`/admin/users?page=${page}`),
  checkEmail:   (email) => api.get(`/admin/check-email?email=${encodeURIComponent(email)}`),
  approveEmail: (email) => api.post('/admin/approve', { email }),
  broadcast:    (msg)   => api.post('/admin/broadcast', { message: msg }),
}

export default api
