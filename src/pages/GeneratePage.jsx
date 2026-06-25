import React, { useState } from 'react'
import { Zap, Copy, CheckCheck, Info } from 'lucide-react'
import { Card, Button, Input, Badge, EmptyState } from '../components/UI'
import { emailAPI } from '../services/api'

export default function GeneratePage() {
  const [count, setCount]   = useState('5')
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState([])
  const [error, setError]   = useState('')
  const [copied, setCopied] = useState({})

  const handleGenerate = async () => {
    const total = Number(count)
    if (!total || total < 1 || total > 5) {
      setError('Jumlah email harus antara 1–5.')
      return
    }
    setLoading(true); setError(''); setEmails([])
    try {
      const { data } = await emailAPI.generate(total)
      setEmails(data?.emails || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'Gagal generate email. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const copyEmail = (email, index) => {
    navigator.clipboard.writeText(email)
    setCopied(prev => ({ ...prev, [index]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [index]: false })), 2000)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(emails.map(item => item.email).join('\n'))
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }} className="fade-up">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Generate Email</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Buat akun Gmail baru untuk disetor ke platform.</p>
      </div>

      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <Input
              label="Jumlah Email"
              type="number"
              min={1}
              max={5}
              value={count}
              error={error}
              onChange={e => { setError(''); setCount(e.target.value) }}
            />
          </div>
          <Button onClick={handleGenerate} loading={loading} size="md" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
            <Zap size={15} /> Generate
          </Button>
          {emails.length > 0 && (
            <Button onClick={copyAll} variant="ghost" size="md">
              <Copy size={15} /> Salin Semua
            </Button>
          )}
        </div>

        <div style={{
          marginTop: '16px', padding: '12px 14px',
          background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)',
          display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <Info size={15} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: '1px' }} />
          <span>
            Password default semua email:{' '}
            <code style={{ fontFamily: 'JetBrains Mono', background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: '4px' }}>
              aass1122
            </code>. Maksimal generate 5 email.
          </span>
        </div>
      </Card>

      {/* Skeleton loading */}
      {loading && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: Number(count) || 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '64px' }} />
            ))}
          </div>
        </Card>
      )}

      {/* Hasil */}
      {!loading && emails.length > 0 && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Hasil Generate — {emails.length} Email</h3>
            <Badge variant="success">{emails.filter(item => item.unregistered).length} Belum Terdaftar</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {emails.map((item, index) => (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)', gap: '12px', border: '1px solid var(--border)',
              }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.email}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {item.firstName} {item.lastName}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <Badge variant={item.unregistered ? 'success' : 'warning'}>
                    {item.unregistered ? 'Belum Terdaftar' : 'Terdaftar'}
                  </Badge>
                  <button onClick={() => copyEmail(item.email, index)} style={{
                    background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '6px 8px', cursor: 'pointer',
                    color: copied[index] ? 'var(--green)' : 'var(--text-muted)',
                    display: 'flex', transition: 'all 0.2s',
                  }}>
                    {copied[index] ? <CheckCheck size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!loading && emails.length === 0 && !error && (
        <EmptyState icon="🧬" title="Belum ada hasil" desc="Klik Generate untuk membuat daftar email baru." />
      )}
    </div>
  )
}