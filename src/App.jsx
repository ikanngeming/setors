import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import GeneratePage from './pages/GeneratePage'
import SetorPage from './pages/SetorPage'
import RiwayatPage from './pages/RiwayatPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'

function AppInner() {
  const { user, loading } = useAuth()
  const [active, setActive] = useState('dashboard')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--blue), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px var(--blue-glow)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="white" strokeWidth="2"/>
              <path d="M2 8l10 6 10-6" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Memuat...</div>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  const pages = {
    dashboard: <Dashboard setActive={setActive} />,
    generate:  <GeneratePage />,
    setor:     <SetorPage />,
    riwayat:   <RiwayatPage />,
    settings:  <SettingsPage />,
    admin:     <AdminPage />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        <Sidebar active={active} setActive={setActive} />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <style>{`
          @media (max-width: 768px) {
            .sidebar-desktop { display: none !important; }
          }
          @media (min-width: 769px) {
            .mobile-nav { display: none !important; }
          }
        `}</style>
        {pages[active] || pages.dashboard}
      </main>

      {/* Mobile bottom nav */}
      <div className="mobile-nav">
        <MobileNav active={active} setActive={setActive} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
