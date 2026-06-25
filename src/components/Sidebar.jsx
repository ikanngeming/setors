import React from 'react'
import { Mail, LayoutDashboard, Send, Clock, Settings, LogOut, Shield, Zap, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'generate', label: 'Generate Email', icon: Zap },
  { id: 'setor', label: 'Setor Email', icon: Send },
  { id: 'riwayat', label: 'Riwayat', icon: Clock },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

export default function Sidebar({ active, setActive }) {
  const { user, logout } = useAuth()
  const isAdmin = user?.isAdmin

  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--blue), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px var(--blue-glow)'
          }}>
            <Mail size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.3px' }}>SetorEmail</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Platform Gmail</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0
          }}>
            {(user?.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: isAdmin ? 'var(--amber)' : 'var(--text-muted)' }}>
              {isAdmin ? '👑 Admin' : 'Member'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, padding: '4px 8px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu
        </div>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => setActive(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              border: 'none', textAlign: 'left',
              background: isActive ? 'var(--blue-glow)' : 'transparent',
              color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
              fontSize: '14px', fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s', cursor: 'pointer', marginBottom: '2px'
            }}>
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={14} />}
            </button>
          )
        })}

        {isAdmin && (
          <>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, padding: '12px 8px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Admin
            </div>
            <button onClick={() => setActive('admin')} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              border: 'none', textAlign: 'left',
              background: active === 'admin' ? 'rgba(245,158,11,0.12)' : 'transparent',
              color: active === 'admin' ? 'var(--amber)' : 'var(--text-secondary)',
              fontSize: '14px', fontWeight: active === 'admin' ? 600 : 400,
              transition: 'all 0.15s', cursor: 'pointer'
            }}>
              <Shield size={16} />
              <span style={{ flex: 1 }}>Panel Admin</span>
              {active === 'admin' && <ChevronRight size={14} />}
            </button>
          </>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
          border: 'none', background: 'transparent',
          color: 'var(--text-muted)', fontSize: '14px',
          transition: 'all 0.15s', cursor: 'pointer'
        }}>
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
