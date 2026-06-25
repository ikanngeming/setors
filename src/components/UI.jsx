import React from 'react'

export function Card({ children, className = '', glow = false, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${glow ? 'var(--blue)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '24px',
      boxShadow: glow ? '0 0 24px var(--blue-glow)' : 'var(--shadow)',
      ...style
    }} className={className}>
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, onClick, style = {}, type = 'button' }) {
  const sizes = { sm: '8px 16px', md: '12px 24px', lg: '16px 32px' }
  const fontSizes = { sm: '13px', md: '14px', lg: '16px' }
  const variants = {
    primary: { background: 'var(--blue)', color: '#fff', border: 'none' },
    success: { background: 'var(--green)', color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red)', color: '#fff', border: 'none' },
    amber: { background: 'var(--amber)', color: '#000', border: 'none' },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: sizes[size],
        fontSize: fontSizes[size],
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        opacity: (disabled || loading) ? 0.5 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        ...variants[variant],
        ...style
      }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}

export function Input({ label, error, icon, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
            {icon}
          </span>
        )}
        <input {...props} style={{
          width: '100%',
          padding: icon ? '12px 12px 12px 40px' : '12px 16px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
          ...props.style
        }} />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

export function Badge({ children, variant = 'default' }) {
  const colors = {
    default: { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)' },
    success: { bg: 'rgba(16,185,129,0.15)', color: 'var(--green)' },
    warning: { bg: 'rgba(245,158,11,0.15)', color: 'var(--amber)' },
    danger: { bg: 'rgba(239,68,68,0.15)', color: 'var(--red)' },
    info: { bg: 'var(--blue-glow)', color: 'var(--blue)' },
  }
  const c = colors[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 600,
      background: c.bg, color: c.color
    }}>
      {children}
    </span>
  )
}

export function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block' }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function StatusDot({ status }) {
  const colors = { Pending: 'var(--amber)', accepted: 'var(--green)', rejected: 'var(--red)' }
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
      background: colors[status] || 'var(--text-muted)',
      boxShadow: `0 0 6px ${colors[status] || 'transparent'}`
    }} />
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '28px', maxWidth: '480px', width: '100%',
        animation: 'fadeUp 0.25s ease'
      }}>
        {title && <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>{title}</h3>}
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{title}</p>
      <p style={{ fontSize: '14px' }}>{desc}</p>
    </div>
  )
}

export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      {label && <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}
