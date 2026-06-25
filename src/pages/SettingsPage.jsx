import React, { useState } from 'react'
import { User, Phone, Lock, Save, Plus, Trash2, CreditCard, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { Card, Button, Input, Modal, Divider } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { userAPI, authAPI } from '../services/api'

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth()

  // ─── State ────────────────────────────────────────────────────────────────
  const [saved, setSaved]               = useState(false)
  const [showPass, setShowPass]         = useState(false)
  const [showCurrPass, setShowCurrPass] = useState(false)
  const [danaModal, setDanaModal]       = useState(false)
  const [deleteModal, setDeleteModal]   = useState(false)
  const [newDana, setNewDana]           = useState({ nomor: '', nama: '' })
  const [deletePassword, setDeletePassword] = useState('')

  const [form, setForm] = useState({
    username:        user?.username || '',
    currentPassword: '',
    password:        '',
    confirmPassword: '',
  })

  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState({
    profile: false,
    dana:    false,
    delete:  false,
  })

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const setLoad = (k, v) => setLoading(l => ({ ...l, [k]: v }))

  // ─── Simpan Profil & Password ─────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    const errs = {}

    if (!form.username.trim())
      errs.username = 'Username wajib diisi.'

    if (form.password) {
      if (!form.currentPassword)
        errs.currentPassword = 'Password lama wajib diisi untuk ganti password.'
      if (form.password.length < 8)
        errs.password = 'Password baru minimal 8 karakter.'
      if (form.password !== form.confirmPassword)
        errs.confirmPassword = 'Password tidak cocok.'
    }

    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoad('profile', true)
    try {
      // 1. Update profil jika username berubah
      if (form.username.trim() !== user?.username) {
        const { data } = await userAPI.updateProfile({ username: form.username.trim() })
        setUser(data.user)
      }

      // 2. Ganti password jika diisi
      if (form.password) {
        await userAPI.changePassword({
          currentPassword: form.currentPassword,
          newPassword:     form.password,
        })
        // Reset field password setelah berhasil
        setForm(f => ({ ...f, currentPassword: '', password: '', confirmPassword: '' }))
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Gagal menyimpan perubahan.'
      // Tampilkan error di field yang relevan
      if (msg.toLowerCase().includes('password lama')) {
        setErrors(e => ({ ...e, currentPassword: msg }))
      } else {
        setErrors(e => ({ ...e, username: msg }))
      }
    } finally {
      setLoad('profile', false)
    }
  }

  // ─── Tambah Akun Dana ─────────────────────────────────────────────────────
  const addDana = async () => {
    if (!newDana.nomor || !newDana.nama) return
    setLoad('dana', true)
    try {
      const updatedDana = [...(user?.dana || []), newDana]
      const { data } = await userAPI.updateProfile({ dana: updatedDana })
      setUser(data.user)
      setNewDana({ nomor: '', nama: '' })
      setDanaModal(false)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Gagal menambah akun Dana.'
      setErrors(e => ({ ...e, dana: msg }))
    } finally {
      setLoad('dana', false)
    }
  }

  // ─── Hapus Akun Dana ──────────────────────────────────────────────────────
  const removeDana = async (i) => {
    const updated = [...(user?.dana || [])]
    updated.splice(i, 1)
    try {
      const { data } = await userAPI.updateProfile({ dana: updated })
      setUser(data.user)
    } catch {
      // silent fail — data tidak berubah jika gagal
    }
  }

  // ─── Hapus Akun ───────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!deletePassword) return
    setLoad('delete', true)
    try {
      await userAPI.deleteAccount({ password: deletePassword })
      logout() // hapus state lokal & redirect
    } catch (err) {
      const msg = err?.response?.data?.error || 'Gagal menghapus akun.'
      setErrors(e => ({ ...e, deletePassword: msg }))
    } finally {
      setLoad('delete', false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px', maxWidth: '640px' }} className="fade-up">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Pengaturan</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Kelola profil dan akun pembayaran kamu.</p>
      </div>

      {/* ── Profil ── */}
      <Card style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="var(--blue)" /> Profil Akun
        </h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 800, color: '#fff',
            }}>
              {(user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{user?.username}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: {user?.id}</div>
            </div>
          </div>

          <Divider />

          <Input
            label="Username"
            icon={<User size={15} />}
            value={form.username}
            onChange={e => set('username', e.target.value)}
            error={errors.username}
          />

          {/* Password Lama — muncul hanya jika mulai mengisi password baru */}
          {form.password.length > 0 && (
            <div style={{ position: 'relative' }}>
              <Input
                label="Password Lama"
                type={showCurrPass ? 'text' : 'password'}
                icon={<Lock size={15} />}
                placeholder="Masukkan password saat ini"
                value={form.currentPassword}
                onChange={e => set('currentPassword', e.target.value)}
                error={errors.currentPassword}
              />
              <button type="button" onClick={() => setShowCurrPass(v => !v)} style={{
                position: 'absolute', right: '12px', top: '34px',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
              }}>
                {showCurrPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          )}

          {/* Password Baru */}
          <div style={{ position: 'relative' }}>
            <Input
              label="Password Baru (opsional)"
              type={showPass ? 'text' : 'password'}
              icon={<Lock size={15} />}
              placeholder="Kosongkan jika tidak ingin ganti"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              error={errors.password}
            />
            <button type="button" onClick={() => setShowPass(v => !v)} style={{
              position: 'absolute', right: '12px', top: '34px',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {form.password && (
            <Input
              label="Konfirmasi Password"
              type="password"
              icon={<Lock size={15} />}
              placeholder="Ulangi password baru"
              value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button type="submit" disabled={loading.profile}>
              <Save size={15} /> {loading.profile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            {saved && (
              <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>
                ✓ Tersimpan!
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* ── Akun Dana ── */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} color="var(--blue)" /> Akun Dana
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setDanaModal(true)}>
            <Plus size={14} /> Tambah
          </Button>
        </div>

        {(!user?.dana || user.dana.length === 0) ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            <CreditCard size={28} style={{ marginBottom: '8px', opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
            Belum ada akun Dana terdaftar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user.dana.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #118EEA, #0F5FA8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px',
                  }}>💙</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{d.nama}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>{d.nomor}</div>
                  </div>
                </div>
                {i === 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '999px' }}>
                    Utama
                  </span>
                )}
                <button onClick={() => removeDana(i)} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: '4px', borderRadius: '6px',
                  display: 'flex', transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Danger Zone ── */}
      <Card style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--red)', marginBottom: '12px' }}>Zona Berbahaya</h3>

        {/* Logout */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Keluar dari sesi ini. Kamu bisa login kembali kapan saja.
          </p>
          <Button variant="danger" onClick={logout}>Keluar Sekarang</Button>
        </div>

        <Divider />

        {/* Hapus Akun */}
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Hapus akun secara permanen. Semua data termasuk saldo dan riwayat akan dihapus dan tidak bisa dipulihkan.
          </p>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            <AlertTriangle size={14} /> Hapus Akun
          </Button>
        </div>
      </Card>

      {/* ── Modal Tambah Dana ── */}
      <Modal open={danaModal} onClose={() => { setDanaModal(false); setErrors(e => ({ ...e, dana: '' })) }} title="Tambah Akun Dana">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Nomor Dana"
            placeholder="08xxxxxxxxxx"
            icon={<Phone size={15} />}
            value={newDana.nomor}
            onChange={e => setNewDana(d => ({ ...d, nomor: e.target.value }))}
          />
          <Input
            label="Nama Pemilik"
            placeholder="Nama sesuai akun Dana"
            icon={<User size={15} />}
            value={newDana.nama}
            onChange={e => setNewDana(d => ({ ...d, nama: e.target.value }))}
          />
          {errors.dana && (
            <p style={{ fontSize: '12px', color: 'var(--red)', margin: 0 }}>{errors.dana}</p>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setDanaModal(false)}>Batal</Button>
            <Button onClick={addDana} disabled={!newDana.nomor || !newDana.nama || loading.dana}>
              <Plus size={15} /> {loading.dana ? 'Menambah...' : 'Tambah'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Hapus Akun ── */}
      <Modal open={deleteModal} onClose={() => { setDeleteModal(false); setDeletePassword(''); setErrors(e => ({ ...e, deletePassword: '' })) }} title="Hapus Akun Permanen">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', padding: '14px', fontSize: '13px', color: 'var(--red)',
          }}>
            ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data akun, saldo, dan riwayat transaksi akan dihapus permanen.
          </div>
          <Input
            label="Konfirmasi Password"
            type="password"
            icon={<Lock size={15} />}
            placeholder="Masukkan password untuk konfirmasi"
            value={deletePassword}
            onChange={e => { setDeletePassword(e.target.value); setErrors(er => ({ ...er, deletePassword: '' })) }}
            error={errors.deletePassword}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDeleteAccount} disabled={!deletePassword || loading.delete}>
              <AlertTriangle size={14} /> {loading.delete ? 'Menghapus...' : 'Hapus Akun'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}