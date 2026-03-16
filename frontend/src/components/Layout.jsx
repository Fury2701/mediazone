import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAuthStore from '../hooks/useAuth'
import AuthModal from './AuthModal'
import { statsApi } from '../api/client'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const [modal, setModal]   = useState(null) // 'login' | 'register' | null
  const [online, setOnline] = useState(247)
  const navigate = useNavigate()

  useEffect(() => {
    statsApi.public().then(r => setOnline(r.data.online_now)).catch(() => {})
    const t = setInterval(() => {
      statsApi.public().then(r => setOnline(r.data.online_now)).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const navCls = ({ isActive }) =>
    `flex items-center h-14 px-4 font-condensed font-bold text-xs tracking-widest uppercase transition-all relative
     after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-cyan after:transition-transform
     ${isActive ? 'text-white after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-white hover:after:scale-x-100'}`

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-bg/97 border-b border-border backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 h-14">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-cyan flex items-center justify-center"
              style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }}
            />
            <span className="font-condensed font-black text-lg tracking-widest">
              MEDIA<span className="text-cyan">ZONE</span>
            </span>
          </div>

          <div className="w-px h-7 bg-border" />

          {/* Links */}
          <div className="flex flex-1">
            <NavLink to="/"       end className={navCls}>Головна</NavLink>
            <NavLink to="/forum"      className={navCls}>Форум</NavLink>
            <NavLink to="/about"      className={navCls}>Про проект</NavLink>
            {user && <NavLink to="/cabinet" className={navCls}>Кабінет</NavLink>}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 border border-green/30 px-2.5 h-7 font-mono text-xs text-green">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              {online} ONLINE
            </div>

            {user ? (
              <>
                <span className="font-mono text-xs text-muted">// {user.username.toUpperCase()}</span>
                <button className="btn-ghost" onClick={() => navigate('/cabinet')}>Профіль</button>
                <button className="btn-ghost !text-red !border-red/30 hover:!border-red hover:!text-red" onClick={logout}>
                  Вийти
                </button>
              </>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => setModal('login')}>Увійти</button>
                <button className="btn-cyan !h-8 !text-xs" onClick={() => setModal('register')}>Реєстрація</button>
              </>
            )}
          </div>
        </div>

        {/* Ticker */}
        <div className="bg-cyan h-8 overflow-hidden">
          <div className="flex items-center h-full whitespace-nowrap animate-[ticker_30s_linear_infinite]"
            style={{ animation: 'ticker 30s linear infinite' }}>
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex items-center">
                {['MEDIA ZONE RP','СЕРВЕР ОНЛАЙН 24/7','FiveM GTA 5 ROLEPLAY','K3S + ARGOCD','GITHUB ACTIONS CI/CD','ОНОВЛЕННЯ В РОЗРОБЦІ'].map((t, j) => (
                  <span key={j} className="flex items-center">
                    <span className="text-bg font-condensed font-black text-xs tracking-widest uppercase px-8">{t}</span>
                    <span className="text-bg/40">///</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Outlet />

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onSwitch={setModal} />}
    </div>
  )
}
