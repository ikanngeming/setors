import React, { useEffect, useState } from 'react'
import { TrendingUp, Clock, CheckCircle, Wallet, ArrowUpRight, Mail, Zap, Send, RefreshCw } from 'lucide-react'
import { Card, Badge, StatusDot } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../api'

function toRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color, marginTop: '4px', fontWeight: 500 }}>{sub}</div>}
      </div>
    </Card>
  )
}

export default function Dashboard({ setActive }) {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  
  // Refresh profil user dari server saat Dashboard dibuka
  const refreshProfile = async () => {
    setLoading(true)
    try {
      const { data } = await userAPI.getProfile()
      if (data?.user) setUser(data.user)
    } catch {
      // Gagal refresh — tampilkan data cache dari context
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => { refreshProfile() }, [])
  
  const recent = (user?.riwayat || []).slice(-5).reverse()
  
  return (
    <div style={{ padding: '32px', maxWidth: '900px' }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>
            Selamat datang, {user?.username} 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Pantau aktivitas dan mulai setor email hari ini.</p>
        </div>
        <button onClick={refreshProfile} disabled={loading} style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px',
          padding: '8px', cursor: loading ? 'default' : 'pointer', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center',
        }}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon={Wallet}      label="Total Saldo"  value={toRupiah(user?.saldo)}            color="var(--green)"  sub="Siap dicairkan" />
        <StatCard icon={Clock}       label="Pending"      value={user?.pending  || 0}               color="var(--amber)"  sub="Sedang diproses" />
        <StatCard icon={CheckCircle} label="Diterima"     value={user?.diterima || 0}               color="var(--blue)"   sub="Email lolos verifikasi" />
        <StatCard icon={TrendingUp}  label="Total Setor"  value={(user?.riwayat || []).length}      color="#8B5CF6"       sub="Semua waktu" />
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-secondary)' }}>Aksi Cepat</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Generate Email', icon: Zap,   page: 'generate', color: 'var(--blue)'  },
            { label: 'Setor Email',    icon: Send,   page: 'setor',    color: 'var(--green)' },
            { label: 'Lihat Riwayat', icon: Clock,  page: 'riwayat',  color: 'var(--amber)' },
          ].map(({ label, icon: Icon, page, color }) => (
            <button key={page} onClick={() => setActive(page)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: 'var(--radius-sm)',
              background: `${color}12`, border: `1px solid ${color}30`,
              color, fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <Icon size={15} /> {label} <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Recent history */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Riwayat Terbaru</h3>
          <button onClick={() => setActive('riwayat')} style={{
            background: 'none', border: 'none', color: 'var(--blue)',
            fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            Lihat semua <ArrowUpRight size={13} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '56px' }} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            <Mail size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px' }}>Belum ada riwayat. Mulai setor email sekarang!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recent.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusDot status={r.status} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>{r.email}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('id-ID') : '—'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>{toRupiah(r.saldo)}</div>
                  <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>
                    {r.status === 'accepted' ? 'Diterima' : r.status === 'rejected' ? 'Ditolak' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info banner */}
      <div style={{
        marginTop: '20px', padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08))',
        border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--blue)' }}>📋 Peraturan Penting:</strong>
        {' '}Buat Gmail sesuai peraturan room · Proses pending 1–2 hari · Pencairan dana sekitar 1–2 menit setelah ACC
      </div>
    </div>
  )
}