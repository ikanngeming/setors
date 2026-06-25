import React from 'react'
import { LayoutDashboard, Zap, Send, Clock, Settings, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'generate', label: 'Generate', icon: Zap },
  { id: 'setor', label: 'Setor', icon: Send },
  { id: 'riwayat', label: 'Riwayat', icon: Clock },
  { id: 'settings', label: 'Profil', icon: Settings },
]

export default function MobileNav({ active, setActive }) {
  const { user } = useAuth()
  const isAdmin = user?.isAdmin

  const items = isAdmin
    ? [...navItems.slice(0, 4), { id: 'admin', label: 'Admin', icon: Shield }, navItems[4]]
    : navItems

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'stretch',
      backdropFilter: 'blur(12px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button key={id} onClick={() => setActive(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '3px', padding: '10px 4px',
            border: 'none', background: 'transparent',
            color: isActive ? 'var(--blue)' : 'var(--text-muted)',
            fontSize: '10px', fontWeight: isActive ? 700 : 400,
            cursor: 'pointer', transition: 'all 0.15s', position: 'relative'
          }}>
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%',
                height: '2px', background: 'var(--blue)',
                borderRadius: '0 0 4px 4px'
              }} />
            )}
            <Icon size={20} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
