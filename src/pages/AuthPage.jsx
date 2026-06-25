import React, { useState } from 'react'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Card, Button, Input, Divider, Spinner } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'

export default function AuthPage() {
  const { login } = useAuth()

  const [mode, setMode]       = useState('login') // login | register | otp
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [form, setForm] = useState({
    username: '',
    email:    '',
    password: '',
    phone:    '',
    otp:      '',
  })

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  // ─── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi.')
      return
    }
    setLoading(true); setError('')
    try {
      const { data } = await authAPI.login({ email: form.email, password: form.password })
      login(data.user) // simpan ke AuthContext, cookie sudah di-set server
    } catch (err) {
      setError(err?.response?.data?.error || 'Login gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Register → kirim OTP ────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password || !form.phone) {
      setError('Semua field wajib diisi.')
      return
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    setLoading(true); setError('')
    try {
      await authAPI.register({
        username: form.username,
        email:    form.email,
        password: form.password,
        phone:    form.phone,
      })
      setMode('otp')
      startResendCooldown()
    } catch (err) {
      setError(err?.response?.data?.error || 'Pendaftaran gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Verifikasi OTP ───────────────────────────────────────────────────────
  const handleOtp = async (e) => {
    e.preventDefault()
    if (form.otp.length !== 6) {
      setError('Kode OTP harus 6 digit.')
      return
    }
    setLoading(true); setError('')
    try {
      const { data } = await authAPI.verifyOtp(form.email, form.otp)
      login(data.user) // akun dibuat, session aktif
    } catch (err) {
      setError(err?.response?.data?.error || 'OTP salah atau sudah kedaluwarsa.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Kirim ulang OTP ─────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setLoading(true); setError('')
    try {
      await authAPI.register({
        username: form.username,
        email:    form.email,
        password: form.password,
        phone:    form.phone,
      })
      startResendCooldown()
    } catch (err) {
      setError(err?.response?.data?.error || 'Gagal mengirim ulang OTP.')
    } finally {
      setLoading(false)
    }
  }

  // Cooldown 60 detik setelah kirim OTP
  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const switchMode = (m) => { setMode(m); setError(''); setForm(f => ({ ...f, otp: '' })) }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }} className="fade-up">
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 14px',
            background: 'linear-gradient(135deg, var(--blue), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px var(--blue-glow)',
          }}>
            <Mail size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>SetorEmail</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Platform setor Gmail terpercaya</p>
        </div>

        <Card className="fade-up-delay">
          {/* Tabs — sembunyikan saat mode OTP */}
          {mode !== 'otp' && (
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '4px', marginBottom: '24px' }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => switchMode(m)} style={{
                  flex: 1, padding: '9px', borderRadius: '6px', border: 'none',
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '14px', fontWeight: mode === m ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                }}>
                  {m === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px',
              fontSize: '13px', color: 'var(--red)', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* ── Form Login ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Email"
                type="email"
                placeholder="email@gmail.com"
                icon={<Mail size={16} />}
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
              <div style={{ position: 'relative' }}>
                <Input
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  icon={<Lock size={16} />}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: '12px', top: '34px',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
                Masuk <ArrowRight size={16} />
              </Button>
            </form>
          )}

          {/* ── Form Register ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Username"
                placeholder="Buat username"
                icon={<User size={16} />}
                value={form.username}
                onChange={e => set('username', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@gmail.com"
                icon={<Mail size={16} />}
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
              <Input
                label="Nomor Dana"
                placeholder="08xxxxxxxxxx"
                icon={<Phone size={16} />}
                value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
              />
              <div style={{ position: 'relative' }}>
                <Input
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  icon={<Lock size={16} />}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: '12px', top: '34px',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
                Daftar & Kirim OTP <ArrowRight size={16} />
              </Button>
            </form>
          )}

          {/* ── Form OTP ── */}
          {mode === 'otp' && (
            <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
                <h3 style={{ fontWeight: 700, marginBottom: '6px' }}>Cek Email Anda</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Kode OTP dikirim ke <strong>{form.email}</strong>
                </p>
              </div>

              <Input
                label="Kode OTP (6 digit)"
                placeholder="000000"
                maxLength={6}
                value={form.otp}
                onChange={e => set('otp', e.target.value.replace(/\D/g, ''))}
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontFamily: 'JetBrains Mono, monospace' }}
              />

              <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
                Verifikasi <ArrowRight size={16} />
              </Button>

              {/* Kirim ulang OTP */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    fontSize: '13px',
                    color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--blue)',
                  }}
                >
                  {resendCooldown > 0 ? `Kirim ulang OTP dalam ${resendCooldown}s` : 'Kirim ulang OTP'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => switchMode('register')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}
              >
                ← Kembali
              </button>
            </form>
          )}
        </Card>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
          © 2024 SetorEmail · Aman & Terpercaya
        </p>
      </div>
    </div>
  )
}