import React, { useState, useEffect, useCallback } from 'react'
import { Users, Search, CheckCircle, Send, BarChart2, Mail, ChevronLeft, ChevronRight, Megaphone, RefreshCw } from 'lucide-react'
import { Card, Button, Input, Badge, EmptyState, Modal } from '../components/UI'
import { adminAPI } from '../services/api'

function toRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
}

const TABS = [
  { id: 'users',     label: 'Data User',  icon: Users },
  { id: 'cek',       label: 'Cek Email',  icon: Search },
  { id: 'broadcast', label: 'Broadcast',  icon: Megaphone },
  { id: 'stats',     label: 'Statistik',  icon: BarChart2 },
]

export default function AdminPage() {
  const [tab, setTab] = useState('users')

  // ── Users Tab ──────────────────────────────────────────────────────────────
  const [allUsers, setAllUsers]     = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchUser, setSearchUser] = useState('')

  // ── Cek Email Tab ──────────────────────────────────────────────────────────
  const [cekEmail, setCekEmail]     = useState('')
  const [cekResult, setCekResult]   = useState(null) // null | 'not_found' | object
  const [cekLoading, setCekLoading] = useState(false)
  const [approveModal, setApproveModal]   = useState(null)
  const [approveLoading, setApproveLoading] = useState(false)
  const [approveSuccess, setApproveSuccess] = useState(false)

  // ── Broadcast Tab ──────────────────────────────────────────────────────────
  const [broadcastMsg, setBroadcastMsg]   = useState('')
  const [broadcasting, setBroadcasting]   = useState(false)
  const [broadcastDone, setBroadcastDone] = useState(false)
  const [broadcastError, setBroadcastError] = useState('')

  // ── Fetch Users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (p = 0) => {
    setUsersLoading(true); setUsersError('')
    try {
      const { data } = await adminAPI.getUsers(p)
      setAllUsers(data.users || [])
      setTotalPages(data.totalPages || 1)
      setPage(p)
    } catch (err) {
      setUsersError(err?.response?.data?.error || 'Gagal memuat data user.')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers(0) }, [fetchUsers])

  // Filter lokal berdasarkan search (backend sudah paginate)
  const filteredUsers = allUsers.filter(u =>
    u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
    String(u.id).includes(searchUser)
  )

  // ── Statistik (derived dari allUsers) ─────────────────────────────────────
  const totalSaldo    = allUsers.reduce((s, u) => s + (u.saldo    || 0), 0)
  const totalPending  = allUsers.reduce((s, u) => s + (u.pending  || 0), 0)
  const totalDiterima = allUsers.reduce((s, u) => s + (u.diterima || 0), 0)

  // ── Cek Email ──────────────────────────────────────────────────────────────
  const handleCekEmail = async () => {
    if (!cekEmail.trim()) return
    setCekLoading(true); setCekResult(null)
    try {
      const { data } = await adminAPI.checkEmail(cekEmail.trim())
      setCekResult(data.found ? data : 'not_found')
    } catch (err) {
      if (err?.response?.status === 404) {
        setCekResult('not_found')
      } else {
        setCekResult('not_found')
      }
    } finally {
      setCekLoading(false)
    }
  }

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setApproveLoading(true)
    try {
      await adminAPI.approveEmail(approveModal.riwayat?.email || cekEmail)
      setApproveSuccess(true)
      setApproveModal(null)
      setCekResult(null); setCekEmail('')
      fetchUsers(page) // refresh data user
    } catch (err) {
      // tetap tutup modal, error minor
      setApproveModal(null)
    } finally {
      setApproveLoading(false)
      setTimeout(() => setApproveSuccess(false), 2500)
    }
  }

  // ── Broadcast ──────────────────────────────────────────────────────────────
  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return
    setBroadcasting(true); setBroadcastDone(false); setBroadcastError('')
    try {
      await adminAPI.broadcast(broadcastMsg.trim())
      setBroadcastDone(true)
      setTimeout(() => { setBroadcastDone(false); setBroadcastMsg('') }, 3000)
    } catch (err) {
      setBroadcastError(err?.response?.data?.error || 'Gagal mengirim broadcast.')
    } finally {
      setBroadcasting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px', maxWidth: '900px' }} className="fade-up">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '999px', fontSize: '12px', color: 'var(--amber)', fontWeight: 600 }}>
            👑 Admin Panel
          </div>
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px' }}>Panel Administrator</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Kelola user, verifikasi email, dan broadcast pesan.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '5px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 16px', borderRadius: '9px', border: 'none',
            background: tab === id ? 'var(--bg-elevated)' : 'transparent',
            color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '13px', fontWeight: tab === id ? 600 : 400,
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Users ── */}
      {tab === 'users' && (
        <div className="fade-up">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Cari username atau ID..."
                icon={<Search size={15} />}
                value={searchUser}
                onChange={e => { setSearchUser(e.target.value); setPage(0) }}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => fetchUsers(page)} disabled={usersLoading}>
              <RefreshCw size={14} />
            </Button>
          </div>

          {usersError && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--red)', marginBottom: '12px' }}>
              {usersError}
            </div>
          )}

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '11px 20px', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--bg-elevated)' }}>
              <span>User</span><span>Saldo</span><span>Pending</span><span>Diterima</span><span>Dana</span>
            </div>

            {usersLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '52px' }} />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState icon="👥" title="Tidak ada user" desc="Tidak ada user yang cocok dengan pencarian." />
            ) : (
              filteredUsers.map((u, i) => (
                <div key={u.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  padding: '13px 20px', alignItems: 'center',
                  borderBottom: i < filteredUsers.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(u.username || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{u.username}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>{toRupiah(u.saldo)}</span>
                  <span style={{ fontSize: '13px', color: u.pending > 0 ? 'var(--amber)' : 'var(--text-muted)' }}>{u.pending || 0}</span>
                  <span style={{ fontSize: '13px', color: 'var(--blue)' }}>{u.diterima || 0}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    {u.dana?.[0]?.nomor || '—'}
                  </span>
                </div>
              ))
            )}
          </Card>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
              <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => fetchUsers(page - 1)}>
                <ChevronLeft size={14} />
              </Button>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Hal {page + 1} / {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => fetchUsers(page + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Cek Email ── */}
      {tab === 'cek' && (
        <div className="fade-up">
          <Card style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Cek Status Email</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Masukkan alamat email..."
                  icon={<Mail size={15} />}
                  value={cekEmail}
                  onChange={e => { setCekEmail(e.target.value); setCekResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && handleCekEmail()}
                />
              </div>
              <Button onClick={handleCekEmail} loading={cekLoading} disabled={!cekEmail.trim()}>
                <Search size={15} /> Cek
              </Button>
            </div>
          </Card>

          {approveSuccess && (
            <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--green)', marginBottom: '12px' }}>
              ✓ Email berhasil disetujui dan saldo user diperbarui.
            </div>
          )}

          {cekResult && cekResult !== 'not_found' && (
            <Card className="fade-up" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                  {(cekResult.user?.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{cekResult.user?.username}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {cekResult.user?.id}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Email',   val: cekResult.riwayat?.email  || cekEmail, mono: true },
                  { label: 'Harga',   val: toRupiah(cekResult.riwayat?.saldo || 0) },
                  { label: 'Status',  val: cekResult.riwayat?.status || 'Pending' },
                  { label: 'Dana',    val: cekResult.user?.dana?.[0]?.nomor || '—', mono: true },
                ].map(({ label, val, mono }) => (
                  <div key={label} style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{val}</div>
                  </div>
                ))}
              </div>
              {cekResult.riwayat?.status !== 'accepted' ? (
                <Button variant="success" onClick={() => setApproveModal(cekResult)}>
                  <CheckCircle size={15} /> Setujui Email Ini
                </Button>
              ) : (
                <Badge variant="success">✓ Sudah disetujui</Badge>
              )}
            </Card>
          )}

          {cekResult === 'not_found' && (
            <EmptyState icon="🔍" title="Email tidak ditemukan" desc="Email ini tidak ada di database setoran." />
          )}
        </div>
      )}

      {/* ── Tab: Broadcast ── */}
      {tab === 'broadcast' && (
        <div className="fade-up">
          <Card>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Kirim Broadcast</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Pesan ini akan dikirim ke semua {allUsers.length} user terdaftar.
            </p>
            <textarea
              value={broadcastMsg}
              onChange={e => { setBroadcastMsg(e.target.value); setBroadcastError('') }}
              placeholder="Tulis pesan broadcast di sini..."
              rows={6}
              style={{
                width: '100%', padding: '14px', marginBottom: '14px',
                background: 'var(--bg-elevated)', border: `1px solid ${broadcastError ? 'var(--red)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                fontSize: '14px', resize: 'vertical', outline: 'none', lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
            />
            {broadcastError && (
              <p style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '10px' }}>{broadcastError}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Button onClick={handleBroadcast} loading={broadcasting} disabled={!broadcastMsg.trim()}>
                <Send size={15} /> Kirim ke Semua User
              </Button>
              {broadcastDone && (
                <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>
                  ✓ Broadcast berhasil dikirim!
                </span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Statistik ── */}
      {tab === 'stats' && (
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total User',       value: allUsers.length,                                                           icon: '👥', color: 'var(--blue)'   },
            { label: 'Total Saldo User', value: toRupiah(totalSaldo),                                                      icon: '💰', color: 'var(--green)'  },
            { label: 'Total Pending',    value: totalPending,                                                               icon: '⏳', color: 'var(--amber)'  },
            { label: 'Total Diterima',   value: totalDiterima,                                                              icon: '✅', color: 'var(--green)'  },
            { label: 'User Aktif (Dana)',value: allUsers.filter(u => u.dana?.length).length,                               icon: '💳', color: '#8B5CF6'       },
            { label: 'Rate ACC',         value: totalPending + totalDiterima > 0 ? `${Math.round((totalDiterima / (totalPending + totalDiterima)) * 100)}%` : '—', icon: '📈', color: 'var(--blue)' },
          ].map(s => (
            <Card key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Modal open={!!approveModal} onClose={() => setApproveModal(null)} title="Konfirmasi Persetujuan">
        {approveModal && (
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Setujui email <strong style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{approveModal.riwayat?.email || cekEmail}</strong> milik <strong>{approveModal.user?.username}</strong>?
              Dana sebesar <strong style={{ color: 'var(--green)' }}>{toRupiah(approveModal.riwayat?.saldo || 0)}</strong> akan dikreditkan ke saldo user.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setApproveModal(null)}>Batal</Button>
              <Button variant="success" loading={approveLoading} onClick={handleApprove}>
                <CheckCircle size={15} /> Ya, Setujui
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}