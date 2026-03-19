import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuthStore from '../hooks/useAuth'
import AuthModal from './AuthModal'
import { statsApi } from '../api/client'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const [modal, setModal]       = useState(null)
  const [online, setOnline]     = useState(247)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    statsApi.public().then(r => setOnline(r.data.online_now)).catch(() => {})
    const t = setInterval(() => {
      statsApi.public().then(r => setOnline(r.data.online_now)).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const navCls = ({ isActive }) =>
    `flex items-center h-16 px-3 lg:px-4 font-condensed font-bold text-xs tracking-widest uppercase transition-all relative
     after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:transition-transform
     ${isActive
       ? 'text-white after:scale-x-100 after:bg-cyan'
       : 'text-muted after:scale-x-0 after:bg-cyan hover:text-white hover:after:scale-x-100'}`

  const navLinks = [
    { to: '/',       label: 'Головна',   end: true },
    { to: '/forum',  label: 'Форум' },
    { to: '/news',   label: 'Новини' },
    { to: '/rules',  label: 'Правила' },
    { to: '/about',  label: 'Про проект' },
    ...(user ? [{ to: '/cabinet', label: 'Кабінет' }] : []),
  ]

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-bg/95 border-b border-border backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#F72585,#7B2FBE)', clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }}
            />
            <span className="font-display text-xl tracking-widest">
              MEDIA<span className="text-cyan">ZONE</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center flex-1 ml-2">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navCls}>{l.label}</NavLink>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 border border-green/30 px-2.5 h-7 font-mono text-xs text-green rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              {online} ONLINE
            </div>
            {user ? (
              <>
                <span className="font-mono text-xs text-muted hidden lg:block">// {user.username.toUpperCase()}</span>
                <button className="btn-ghost" onClick={() => navigate('/cabinet')}>Профіль</button>
                <button className="btn-ghost !text-red !border-red/30 hover:!border-red hover:!text-red" onClick={logout}>Вийти</button>
              </>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => setModal('login')}>Увійти</button>
                <button className="btn-cyan !h-8 !text-xs !px-4" onClick={() => setModal('register')}>Реєстрація</button>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-3">
            <div className="flex items-center gap-1 border border-green/30 px-2 h-7 font-mono text-[10px] text-green rounded-sm">
              <span className="w-1 h-1 rounded-full bg-green animate-pulse" />
              {online}
            </div>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 text-white"
              aria-label="Menu"
            >
              <span className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-bg/98 backdrop-blur-md pt-16 md:hidden overflow-y-auto">
          <div className="flex flex-col divide-y divide-border">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({ isActive }) =>
                  `px-6 py-5 font-display text-3xl tracking-widest transition-colors ${isActive ? 'text-cyan' : 'text-white'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="p-6 border-t border-border flex flex-col gap-3">
            {user ? (
              <>
                <div className="font-mono text-xs text-muted mb-1">// {user.username.toUpperCase()}</div>
                <button className="btn-ghost w-full !h-11 !text-sm" onClick={() => navigate('/cabinet')}>Профіль</button>
                <button className="btn-ghost w-full !h-11 !text-sm !text-red !border-red/30" onClick={logout}>Вийти</button>
              </>
            ) : (
              <>
                <button className="btn-ghost w-full !h-11 !text-sm" onClick={() => setModal('login')}>Увійти</button>
                <button className="btn-cyan w-full !h-11 !text-sm" onClick={() => setModal('register')}>Реєстрація</button>
              </>
            )}
          </div>
        </div>
      )}

      <Outlet />

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onSwitch={setModal} />}
    </div>
  )
}
