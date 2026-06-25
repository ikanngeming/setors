import React, { useState, useEffect } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { Card, Badge, StatusDot, EmptyState, Input } from '../components/UI'
import { userAPI } from '../services/api'

function toRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
}

const STATUS_FILTERS = ['Semua', 'pending', 'accepted', 'rejected']

export default function RiwayatPage() {
  const [riwayat, setRiwayat]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('Semua')

  // ── Fetch riwayat dari profil user ──────────────────────────────────────────
  const fetchRiwayat = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await userAPI.getHistory()
      // getHistory() mengembalikan riwayat dari endpoint /user/history
      setRiwayat((data.riwayat || []).slice().reverse())
    } catch (err) {
      setError(err?.response?.data?.error || 'Gagal memuat riwayat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRiwayat() }, [])

  // ── Filter & search ────────────────────────────────────────────────────────
  const filtered = riwayat.filter(r => {
    const matchSearch = (r.email || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Semua' || r.status === filter
    return matchSearch && matchFilter
  })

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalPending  = riwayat.filter(r => r.status === 'pending').length
  const totalAcc      = riwayat.filter(r => r.status === 'accepted').length
  const totalEarned   = riwayat.filter(r => r.status === 'accepted').reduce((s, r) => s + Number(r.saldo || 0), 0)

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Riwayat Setoran</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Pantau semua email yang pernah kamu setorkan.</p>
        </div>
        <button onClick={fetchRiwayat} disabled={loading} style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px',
          padding: '8px', cursor: loading ? 'default' : 'pointer', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center',
        }}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--red)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Setor', value: riwayat.length, color: 'var(--blue)'  },
          { label: 'Pending',     value: totalPending,   color: 'var(--amber)' },
          { label: 'Diterima',    value: totalAcc,        color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {totalEarned > 0 && (
        <div style={{
          marginBottom: '20px', padding: '14px 18px',
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total penghasilan dari setoran</span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green)' }}>{toRupiah(totalEarned)}</span>
        </div>
      )}

      {/* Search & Filter */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input
              placeholder="Cari email..."
              icon={<Search size={15} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 14px', borderRadius: '999px',
                border: `1px solid ${filter === f ? 'var(--blue)' : 'var(--border)'}`,
                background: filter === f ? 'var(--blue-glow)' : 'transparent',
                color: filter === f ? 'var(--blue)' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: filter === f ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {f === 'pending' ? 'Pending' : f === 'accepted' ? 'Diterima' : f === 'rejected' ? 'Ditolak' : f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Skeleton loading */}
      {loading && (
        <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '60px' }} />
          ))}
        </Card>
      )}

      {/* List */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon="📭"
          title="Tidak ada data"
          desc={search ? 'Email tidak ditemukan.' : 'Belum ada setoran. Mulai setor sekarang!'}
        />
      )}

      {!loading && filtered.length > 0 && (
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          {filtered.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <StatusDot status={r.status} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontSize: '13px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{r.email}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Dibuat: {r.createdAt ? new Date(r.createdAt).toLocaleString('id-ID') : '—'}
                  {r.acceptedAt && r.acceptedAt !== 'null' && ` · ACC: ${r.acceptedAt}`}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: r.status === 'accepted' ? 'var(--green)' : 'var(--text-secondary)', marginBottom: '4px' }}>
                  {toRupiah(r.saldo)}
                </div>
                <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>
                  {r.status === 'accepted' ? 'Diterima' : r.status === 'rejected' ? 'Ditolak' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}