import React, { useState, useEffect } from 'react'
import { Send, ChevronRight, CheckCircle, Info, AlertCircle, XCircle } from 'lucide-react'
import { Card, Button, Badge, Spinner, EmptyState } from '../components/UI'
import { emailAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function toRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
}

const STEPS = ['Pilih Room', 'Kirim Email', 'Konfirmasi']

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SetorPage() {
  const { user, updateUser } = useAuth()
  const [step, setStep] = useState(0)
  const [rooms, setRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [emailText, setEmailText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [emailResults, setEmailResults] = useState([]) // { email, status: 'success'|'error', reason? }
  const [filter, setFilter] = useState('all') // 'all' | 'success' | 'error'

  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true)
      try {
        const res = await emailAPI.getRooms()
        setRooms(res.data?.rooms || [])
      } catch {
        setRooms([
          { id: 'error', name: 'Erorr', price: 1, description: 'Error', slots: 1, filled: 1 }
        ])
      }
      setLoadingRooms(false)
    }
    fetchRooms()
  }, [])

  const handleSelectRoom = (room) => {
    setSelectedRoom(room)
    setStep(1)
  }

  const parseEmails = () => emailText.split('\n').map(v => v.trim()).filter(v => v)

  const handleSubmit = async () => {
    const emailList = parseEmails()
    if (emailList.length === 0) { setError('Masukkan minimal 1 email.'); return }
    setSubmitting(true); setError('')

    let apiResults = null
    try {
      const res = await emailAPI.deposit({
        roomId: selectedRoom.id,
        listText: emailList.join('\\n')
      })
      apiResults = res?.data?.results || null
    } catch {
      // handled gracefully
    }

    const now = new Date().toLocaleString('id-ID')
    let results

    if (apiResults && Array.isArray(apiResults)) {
      results = apiResults.map(r => ({
        email: r.email,
        status: r.success ? 'success' : 'error',
        reason: r.reason || (r.success ? null : 'Ditolak oleh server')
      }))
    } else {
      results = emailList.map(email => {
        if (!isValidEmail(email)) {
          return { email, status: 'error', reason: 'Format email tidak valid' }
        }
        if (!email.endsWith('@gmail.com')) {
          return { email, status: 'error', reason: 'Hanya menerima Gmail (@gmail.com)' }
        }
        return { email, status: 'success', reason: null }
      })
    }

    setEmailResults(results)

    const successList = results.filter(r => r.status === 'success')
    const newEntries = successList.map(r => ({
      email: r.email,
      saldo: selectedRoom.price - 1000,
      status: 'Pending',
      createAt: now,
      acceptedAt: null
    }))

    if (newEntries.length > 0) {
      updateUser({
        pending: (user?.pending || 0) + newEntries.length,
        riwayat: [...(user?.riwayat || []), ...newEntries]
      })
    }

    setSubmitting(false)
    setStep(2)
    setDone(true)
  }

  const reset = () => {
    setStep(0); setSelectedRoom(null)
    setEmailText(''); setDone(false); setError('')
    setEmailResults([]); setFilter('all')
  }

  const price = selectedRoom ? selectedRoom.price - 1000 : 0
  const emailCount = parseEmails().length

  const successCount = emailResults.filter(r => r.status === 'success').length
  const errorCount = emailResults.filter(r => r.status === 'error').length

  const filteredResults = emailResults.filter(r => {
    if (filter === 'success') return r.status === 'success'
    if (filter === 'error') return r.status === 'error'
    return true
  })

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }} className="fade-up">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Setor Email</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Kirim Gmail yang sudah dibuat untuk diproses admin.</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '28px' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
                background: i < step ? 'var(--green)' : i === step ? 'var(--blue)' : 'var(--bg-elevated)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.3s'
              }}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span style={{
                fontSize: '13px', fontWeight: i === step ? 600 : 400,
                color: i === step ? 'var(--text-primary)' : 'var(--text-muted)'
              }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '1px', background: i < step ? 'var(--green)' : 'var(--border)', margin: '0 10px', transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Room Selection */}
      {step === 0 && (
        <div className="fade-up">
          {loadingRooms ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '90px' }} />)}
            </div>
          ) : rooms.length === 0 ? (
            <div style={{
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderLeft: '4px solid var(--red)',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                background: 'rgba(239,68,68,0.1)',
              }}>
                <XCircle size={18} color="var(--red)" style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--red)',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}>
                  Setoran Sedang Ditutup
                </span>
              </div>

              {/* Body */}
              <div style={{
                padding: '14px 18px',
                background: 'rgba(239,68,68,0.04)',
              }}>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  Semua room saat ini sudah ditutup. Email hasil generate tetap bisa disimpan dan dipakai saat room berikutnya dibuka.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rooms.map(room => {
                const p = room.price - 1000
                const pct = Math.round((room.filled / room.slots) * 100)
                return (
                  <button key={room.id} onClick={() => handleSelectRoom(room)} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '18px 20px', textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                    display: 'flex', alignItems: 'center', gap: '16px'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = '0 0 20px var(--blue-glow)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                      background: 'var(--blue-glow)', border: '1px solid rgba(59,130,246,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px'
                    }}>📬</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>{room.name}</span>
                        <Badge variant="info">{toRupiah(p)}</Badge>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{room.description}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct > 70 ? 'var(--amber)' : 'var(--green)', borderRadius: '2px', transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{room.filled}/{room.slots} slot</span>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Email Input */}
      {step === 1 && selectedRoom && (
        <div className="fade-up">
          <Card style={{ marginBottom: '16px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{selectedRoom.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{toRupiah(price)} per email</div>
              </div>
              <button onClick={() => setStep(0)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>Ganti</button>
            </div>
          </Card>

          <Card style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              Email yang sudah dibuat <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(satu per baris)</span>
            </label>
            <textarea
              value={emailText}
              onChange={e => setEmailText(e.target.value)}
              placeholder={'contoh@gmail.com\ncontoh2@gmail.com\ncontoh3@gmail.com'}
              rows={8}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'var(--bg-elevated)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                fontSize: '13px', fontFamily: 'JetBrains Mono, monospace',
                resize: 'vertical', outline: 'none', lineHeight: 1.7
              }}
            />
            {error && <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '6px' }}>{error}</p>}
          </Card>

          {emailCount > 0 && (
            <Card style={{ marginBottom: '16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Jumlah email</span>
                <span style={{ fontWeight: 700 }}>{emailCount} email</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimasi penghasilan</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>{toRupiah(price * emailCount)}</span>
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" onClick={() => setStep(0)}>← Kembali</Button>
            <Button onClick={handleSubmit} loading={submitting} style={{ flex: 1, justifyContent: 'center' }}>
              <Send size={15} /> Kirim Setoran
            </Button>
          </div>

          <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
            <AlertCircle size={15} color="var(--amber)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>Pastikan email valid dan tidak ada typo. Email yang ditolak tidak akan dibayar.</span>
          </div>
        </div>
      )}

      {/* Step 2: Done */}
      {step === 2 && (
        <div className="fade-up">

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              flex: 1, padding: '16px', borderRadius: 'var(--radius)',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <CheckCircle size={22} color="var(--green)" />
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{successCount}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Email berhasil</div>
              </div>
            </div>
            <div style={{
              flex: 1, padding: '16px', borderRadius: 'var(--radius)',
              background: errorCount > 0 ? 'rgba(239,68,68,0.08)' : 'var(--bg-elevated)',
              border: `1px solid ${errorCount > 0 ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <XCircle size={22} color={errorCount > 0 ? 'var(--red)' : 'var(--text-muted)'} />
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: errorCount > 0 ? 'var(--red)' : 'var(--text-muted)', lineHeight: 1 }}>{errorCount}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Email ditolak</div>
              </div>
            </div>
            <div style={{
              flex: 1, padding: '16px', borderRadius: 'var(--radius)',
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Info size={22} color="var(--blue)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{toRupiah(price * successCount)}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Total penghasilan</div>
              </div>
            </div>
          </div>

          {/* Info banner */}
          {successCount > 0 && (
            <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
              <CheckCircle size={15} color="var(--green)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>Setoran berhasil dikirim. Tunggu 1–2 hari kerja untuk konfirmasi. Dana otomatis masuk ke saldo setelah disetujui.</span>
            </div>
          )}
          {errorCount > 0 && (
            <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
              <XCircle size={15} color="var(--red)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{errorCount} email ditolak dan tidak akan dibayar. Periksa kolomnya di bawah dan coba kirim ulang setelah diperbaiki.</span>
            </div>
          )}

          {/* Filter Tabs */}
          {emailResults.length > 0 && (
            <Card style={{ marginBottom: '0', padding: '0', overflow: 'hidden' }}>
              {/* Tab header */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {[
                  { key: 'all', label: `Semua (${emailResults.length})` },
                  { key: 'success', label: `✅ Berhasil (${successCount})` },
                  { key: 'error', label: `❌ Ditolak (${errorCount})` },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                    flex: 1, padding: '10px 8px', fontSize: '12px', fontWeight: filter === tab.key ? 700 : 400,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: filter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: `2px solid ${filter === tab.key ? 'var(--blue)' : 'transparent'}`,
                    transition: 'all 0.2s'
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Email list */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredResults.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Tidak ada data.</div>
                ) : filteredResults.map((r, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 16px',
                    borderBottom: idx < filteredResults.length - 1 ? '1px solid var(--border)' : 'none',
                    background: r.status === 'error' ? 'rgba(239,68,68,0.03)' : 'transparent',
                    transition: 'background 0.15s'
                  }}>
                    {r.status === 'success'
                      ? <CheckCircle size={15} color="var(--green)" style={{ flexShrink: 0 }} />
                      : <XCircle size={15} color="var(--red)" style={{ flexShrink: 0 }} />
                    }
                    <span style={{
                      flex: 1, fontSize: '13px', fontFamily: 'JetBrains Mono, monospace',
                      color: r.status === 'error' ? 'var(--red)' : 'var(--text-primary)',
                      wordBreak: 'break-all'
                    }}>{r.email}</span>
                    {r.reason && (
                      <span style={{
                        fontSize: '11px', color: 'var(--red)',
                        background: 'rgba(239,68,68,0.1)', padding: '2px 8px',
                        borderRadius: '99px', whiteSpace: 'nowrap', flexShrink: 0
                      }}>{r.reason}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <Button onClick={reset}>Setor Lagi</Button>
            <Button variant="ghost" onClick={() => window.location.reload()}>Lihat Riwayat</Button>
          </div>
        </div>
      )}
    </div>
  )
}