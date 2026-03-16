import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../hooks/useAuth'
import { usersApi } from '../api/client'
import toast from 'react-hot-toast'

export default function Cabinet() {
  const { user, logout } = useAuthStore()
  const [chars, setChars]   = useState([])
  const [tab, setTab]       = useState('overview')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/'); return }
    usersApi.characters().then(r => setChars(r.data)).catch(() => {})
  }, [user])

  const createChar = async e => {
    e.preventDefault()
    try {
      setCreating(true)
      await usersApi.createCharacter({ name: newName })
      const r = await usersApi.characters()
      setChars(r.data)
      setNewName('')
      toast.success(`Персонаж "${newName}" створено!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    } finally {
      setCreating(false)
    }
  }

  if (!user) return null

  const initials = user.username.slice(0, 2).toUpperCase()
  const totalHours = chars.reduce((s, c) => s + c.hours, 0)
  const maxLevel   = chars.length ? Math.max(...chars.map(c => c.level)) : 1
  const xpPct      = Math.min(100, ((maxLevel % 10) / 10) * 100)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-6">Особистий кабінет</div>
      <div className="grid grid-cols-[240px_1fr] gap-px bg-border min-h-[70vh]">
        {/* Sidebar */}
        <div className="bg-bg2 flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="w-14 h-14 bg-cyan flex items-center justify-center font-condensed font-black text-xl text-bg mb-3"
              style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }}>
              {initials}
            </div>
            <div className="font-condensed font-black text-base uppercase tracking-wide">{user.username}</div>
            <div className="font-mono text-xs text-cyan tracking-widest">// PLAYER</div>
          </div>
          <div className="flex-1">
            {[
              { id: 'overview',  label: '▸ Огляд' },
              { id: 'chars',     label: '▸ Персонажі' },
              { id: 'settings',  label: '▸ Налаштування' },
            ].map(m => (
              <div key={m.id}
                onClick={() => setTab(m.id)}
                className={`flex items-center gap-3 px-5 py-3.5 border-l-[3px] cursor-pointer transition-all font-condensed font-bold text-sm uppercase tracking-wide
                  ${tab === m.id ? 'border-cyan text-white bg-bg3' : 'border-transparent text-muted hover:text-white hover:bg-bg3'}`}
              >
                {m.label}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <button onClick={logout} className="btn-ghost w-full !text-red !border-red/30 hover:!border-red">Вийти</button>
          </div>
        </div>

        {/* Main */}
        <div className="bg-bg p-6">
          {tab === 'overview' && (
            <>
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Статистика акаунту</div>
              <div className="grid grid-cols-3 gap-px bg-border mb-4">
                {[
                  { n: totalHours, l: 'Годин у грі' },
                  { n: maxLevel,   l: 'Макс рівень' },
                  { n: chars.length, l: 'Персонажі' },
                ].map(s => (
                  <div key={s.l} className="bg-bg2 p-4 text-center">
                    <div className="font-condensed font-black text-4xl text-white font-mono">{s.n}</div>
                    <div className="font-mono text-xs text-muted uppercase tracking-widest mt-1">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="bg-bg2 border border-border p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-xs text-muted">XP · Рівень {maxLevel}</span>
                  <span className="font-mono text-xs text-cyan">{xpPct.toFixed(0)}%</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-cyan transition-all duration-1000" style={{ width: `${xpPct}%` }} />
                </div>
              </div>

              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Персонажі</div>
              <div className="flex flex-col gap-px bg-border">
                {chars.length === 0 && (
                  <div className="bg-bg2 p-6 text-center font-mono text-sm text-muted">Немає персонажів — створіть першого!</div>
                )}
                {chars.map(c => (
                  <div key={c.id} className="bg-bg2 flex items-stretch">
                    <div className={`w-1 flex-shrink-0 ${c.is_online ? 'bg-green' : 'bg-border'}`} />
                    <div className="flex-1 px-5 py-3 border-r border-border">
                      <div className="font-condensed font-black text-sm uppercase tracking-wide">{c.name}</div>
                      <div className="font-mono text-xs text-muted">{c.job} · LVL {c.level}</div>
                    </div>
                    <div className="px-5 flex flex-col justify-center text-right">
                      <div className="font-mono text-sm font-bold text-green">${c.cash.toLocaleString()}</div>
                      <div className="font-mono text-xs text-muted">BANK: ${c.bank.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'chars' && (
            <>
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Мої персонажі</div>
              <div className="flex flex-col gap-px bg-border mb-4">
                {chars.map(c => (
                  <div key={c.id} className="bg-bg2 flex items-stretch">
                    <div className={`w-1 flex-shrink-0 ${c.is_online ? 'bg-green' : 'bg-border'}`} />
                    <div className="flex-1 px-5 py-4 border-r border-border">
                      <div className="font-condensed font-black text-base uppercase">{c.name}</div>
                      <div className="font-mono text-xs text-muted">{c.job} · {c.hours}год · LVL {c.level}</div>
                    </div>
                    <div className="px-5 flex flex-col justify-center text-right">
                      <div className="font-mono text-sm font-bold text-green">${c.cash.toLocaleString()}</div>
                      <div className="font-mono text-xs text-muted">{c.is_online ? '● ONLINE' : '● OFFLINE'}</div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={createChar} className="bg-bg2 border border-border p-4 flex gap-3">
                <input className="input flex-1" placeholder="Ім'я нового персонажа" value={newName} onChange={e => setNewName(e.target.value)} required />
                <button type="submit" className="btn-cyan flex-shrink-0" disabled={creating}>
                  {creating ? '...' : '+ Створити'}
                </button>
              </form>
            </>
          )}

          {tab === 'settings' && (
            <>
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-4">Інформація акаунту</div>
              <div className="bg-bg2 border border-border p-5 flex flex-col gap-4 max-w-md">
                <div>
                  <div className="label">Нікнейм</div>
                  <div className="input !cursor-default opacity-60">{user.username}</div>
                </div>
                <div>
                  <div className="label">Email</div>
                  <div className="input !cursor-default opacity-60">{user.email}</div>
                </div>
                <div>
                  <div className="label">Роль</div>
                  <div className="input !cursor-default opacity-60">{user.role}</div>
                </div>
                <div>
                  <div className="label">Зареєстрований</div>
                  <div className="input !cursor-default opacity-60">{new Date(user.created_at).toLocaleDateString('uk')}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
