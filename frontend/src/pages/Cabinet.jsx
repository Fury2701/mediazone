import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../hooks/useAuth'
import { usersApi, newsApi, adminApi } from '../api/client'
import toast from 'react-hot-toast'
import { formatDistanceToNow, format } from 'date-fns'
import { uk } from 'date-fns/locale'

const BAN_DURATIONS = [
  { label: '1 година',  hours: 1 },
  { label: '3 години',  hours: 3 },
  { label: '12 годин',  hours: 12 },
  { label: '3 дні',     hours: 72 },
  { label: '7 днів',    hours: 168 },
  { label: '14 днів',   hours: 336 },
  { label: '30 днів',   hours: 720 },
  { label: 'Назавжди',  hours: null },
]

const USER_LIMIT = 20

// Backend returns naive UTC datetimes (no Z). Append Z so JS parses as UTC.
function parseUtc(str) {
  if (!str) return null
  return new Date(str.endsWith('Z') ? str : str + 'Z')
}
function isForumBanned(until) {
  if (!until) return false
  return parseUtc(until) > new Date()
}
function forumBanLabel(until) {
  if (!until) return null
  const d = parseUtc(until)
  if (d.getFullYear() >= 9999) return 'Назавжди'
  return `до ${format(d, 'dd.MM.yyyy HH:mm')}`  // date-fns format uses local TZ
}

export default function Cabinet() {
  const { user, logout, initialized } = useAuthStore()
  const [chars, setChars]         = useState([])
  const [tab, setTab]             = useState('overview')
  const [news, setNews]           = useState([])
  const [newForm, setNewForm]     = useState({ title: '', body: '', image_url: '', video_url: '' })
  const [posting, setPosting]     = useState(false)
  const [pwForm, setPwForm]       = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [adminUsers, setAdminUsers]   = useState([])
  const [userSearch, setUserSearch]   = useState('')
  const [userPage, setUserPage]       = useState(1)
  const [userTotal, setUserTotal]     = useState(0)
  const [usersLoading, setUsersLoading] = useState(false)
  const [forumBanSelects, setForumBanSelects] = useState({}) // userId -> selected hours string
  const searchRef = useRef('')
  const pageRef   = useRef(1)
  const navigate = useNavigate()

  useEffect(() => {
    if (!initialized) return
    if (!user) { navigate('/'); return }
    usersApi.characters().then(r => setChars(r.data)).catch(() => {})
    if (user.role === 'admin') {
      newsApi.list({ limit: 50 }).then(r => setNews(r.data)).catch(() => {})
    }
  }, [user, initialized])

  const loadUsers = useCallback(async (search, pg) => {
    setUsersLoading(true)
    try {
      const r = await adminApi.users({ search: search || undefined, skip: (pg - 1) * USER_LIMIT, limit: USER_LIMIT })
      setAdminUsers(r.data)
      const ct = parseInt(r.headers['x-total-count'] || '0')
      setUserTotal(ct || r.data.length)
    } catch {
      toast.error('Помилка завантаження')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'players' && user && ['admin', 'moderator'].includes(user.role)) {
      loadUsers('', 1)
    }
  }, [tab])

  useEffect(() => { searchRef.current = userSearch }, [userSearch])
  useEffect(() => { pageRef.current   = userPage   }, [userPage])

  useEffect(() => {
    if (tab !== 'players') return
    const t = setTimeout(() => {
      setUserPage(1)
      pageRef.current = 1
      loadUsers(userSearch, 1)
    }, 300)
    return () => clearTimeout(t)
  }, [userSearch])

  const submitNews = async e => {
    e.preventDefault()
    try {
      setPosting(true)
      await newsApi.create({ ...newForm, image_url: newForm.image_url || null, video_url: newForm.video_url || null })
      toast.success('Новину опубліковано!')
      setNewForm({ title: '', body: '', image_url: '', video_url: '' })
      const r = await newsApi.list({ limit: 50 })
      setNews(r.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    } finally {
      setPosting(false)
    }
  }

  const deleteNews = async (id) => {
    try {
      await newsApi.delete(id)
      setNews(prev => prev.filter(n => n.id !== id))
      toast.success('Видалено')
    } catch {
      toast.error('Помилка')
    }
  }

  const submitPw = async e => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Паролі не співпадають')
      return
    }
    try {
      setPwLoading(true)
      await usersApi.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password })
      toast.success('Пароль змінено!')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    } finally {
      setPwLoading(false)
    }
  }

  const reload = () => loadUsers(searchRef.current, pageRef.current)

  const changeRole = async (userId, role) => {
    try {
      await adminApi.setRole(userId, role)
      toast.success('Роль змінено')
      reload()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка зміни ролі')
    }
  }

  const toggleBan = async (userId, isActive) => {
    try {
      await adminApi.banUser(userId)
      toast.success(isActive ? 'Акаунт заблоковано' : 'Акаунт розблоковано')
      reload()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка бану')
    }
  }

  const applyForumBan = async (userId, username) => {
    const hoursStr = forumBanSelects[userId] ?? '1'
    const hours = hoursStr === 'null' ? null : parseInt(hoursStr)
    try {
      await adminApi.forumBan(userId, hours)
      const label = hours === null ? 'Назавжди' : BAN_DURATIONS.find(d => d.hours === hours)?.label || `${hours}г`
      toast.success(`${username} заблоковано на форумі (${label})`)
      reload()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    }
  }

  const removeForumBan = async (userId, username) => {
    try {
      await adminApi.forumBan(userId, 0)
      toast.success(`${username} розблоковано на форумі`)
      reload()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    }
  }

  if (!initialized) return null
  if (!user) return null

  const initials   = user.username.slice(0, 2).toUpperCase()
  const totalHours = chars.reduce((s, c) => s + c.hours, 0)
  const maxLevel   = chars.length ? Math.max(...chars.map(c => c.level)) : 1
  const xpPct      = Math.min(100, ((maxLevel % 10) / 10) * 100)

  const tabs = [
    { id: 'overview',  label: 'Огляд' },
    { id: 'chars',     label: 'Персонажі' },
    { id: 'settings',  label: 'Налаштування' },
    ...(user.role === 'admin' ? [{ id: 'news', label: '📢 Новини' }] : []),
    ...(['admin', 'moderator'].includes(user.role) ? [{ id: 'players', label: '👥 Гравці' }] : []),
  ]

  const roleColors = { admin: 'text-red', moderator: 'text-orange', player: 'text-cyan' }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-6">Особистий кабінет</div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-px bg-border min-h-[60vh]">
        {/* Sidebar */}
        <div className="bg-bg2 flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-condensed font-black text-xl text-white mb-3"
              style={{ background: 'linear-gradient(135deg,#F72585,#7B2FBE)', clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }}>
              {initials}
            </div>
            <div className="font-condensed font-black text-base uppercase tracking-wide">{user.username}</div>
            <div className="font-mono text-xs text-cyan tracking-widest">// {user.role.toUpperCase()}</div>
          </div>

          <div className="flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-border">
            {tabs.map(m => (
              <button key={m.id}
                onClick={() => setTab(m.id)}
                className={`flex items-center gap-2 px-4 md:px-5 py-3 md:py-3.5 border-b-2 md:border-b-0 md:border-l-[3px] flex-shrink-0 md:flex-shrink cursor-pointer transition-all font-condensed font-bold text-xs md:text-sm uppercase tracking-wide whitespace-nowrap
                  ${tab === m.id ? 'border-cyan text-white bg-bg3' : 'border-transparent text-muted hover:text-white hover:bg-bg3'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-border hidden md:block mt-auto">
            <button onClick={logout} className="btn-ghost w-full !text-red !border-red/30 hover:!border-red">Вийти</button>
          </div>
        </div>

        {/* Main */}
        <div className="bg-bg p-4 md:p-6">

          {tab === 'overview' && (
            <>
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Статистика акаунту</div>
              <div className="grid grid-cols-3 gap-px bg-border mb-4">
                {[
                  { n: totalHours,   l: 'Годин у грі' },
                  { n: maxLevel,     l: 'Макс рівень' },
                  { n: chars.length, l: 'Персонажі' },
                ].map(s => (
                  <div key={s.l} className="bg-bg2 p-3 md:p-4 text-center">
                    <div className="font-display text-3xl md:text-4xl text-white">{s.n}</div>
                    <div className="font-mono text-[10px] text-muted uppercase tracking-widest mt-1">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="bg-bg2 border border-border p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-xs text-muted">XP · Рівень {maxLevel}</span>
                  <span className="font-mono text-xs text-cyan">{xpPct.toFixed(0)}%</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-1000 rounded-full"
                    style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg,#F72585,#7B2FBE)' }} />
                </div>
              </div>

              {isForumBanned(user.forum_banned_until) && (
                <div className="bg-orange/5 border border-orange/30 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
                  <span className="text-orange text-lg flex-shrink-0">🚫</span>
                  <div>
                    <div className="font-condensed font-black text-sm uppercase tracking-wide text-orange mb-0.5">
                      Форум-бан активний
                    </div>
                    <div className="font-mono text-xs text-orange/70">
                      Ви не можете писати на форумі&nbsp;
                      {forumBanLabel(user.forum_banned_until) === 'Назавжди'
                        ? '— бан постійний'
                        : forumBanLabel(user.forum_banned_until)}
                    </div>
                  </div>
                </div>
              )}

              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Персонажі</div>
              <div className="flex flex-col gap-px bg-border">
                {chars.length === 0 && (
                  <div className="bg-bg2 p-6 text-center">
                    <div className="font-mono text-sm text-muted mb-1">Немає персонажів</div>
                    <div className="font-mono text-xs text-muted2">Підключіться до сервера FiveM щоб створити персонажа</div>
                  </div>
                )}
                {chars.map(c => (
                  <div key={c.id} className="bg-bg2 flex items-stretch">
                    <div className={`w-1 flex-shrink-0 ${c.is_online ? 'bg-green' : 'bg-border'}`} />
                    <div className="flex-1 px-4 md:px-5 py-3 border-r border-border min-w-0">
                      <div className="font-condensed font-black text-sm uppercase tracking-wide truncate">{c.name}</div>
                      <div className="font-mono text-xs text-muted">{c.job} · LVL {c.level}</div>
                    </div>
                    <div className="px-4 md:px-5 flex flex-col justify-center text-right flex-shrink-0">
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
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-1">Мої персонажі</div>
              <div className="font-mono text-xs text-muted2 mb-4">Персонажі створюються тільки через гру (FiveM)</div>
              {chars.length === 0 ? (
                <div className="bg-bg2 border border-border p-8 text-center">
                  <div className="text-4xl mb-3">🎮</div>
                  <div className="font-condensed font-black text-xl text-white mb-2">Немає персонажів</div>
                  <div className="font-mono text-xs text-muted max-w-xs mx-auto">
                    Підключіться до сервера MediaZone у FiveM і створіть свого першого персонажа
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {chars.map(c => (
                    <div key={c.id} className="bg-bg2 border border-border overflow-hidden">
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.is_online ? 'bg-green' : 'bg-muted2'}`} />
                        <div className="font-condensed font-black text-base uppercase tracking-wide flex-1">{c.name}</div>
                        <span className={`font-mono text-[10px] font-bold tracking-widest ${c.is_online ? 'text-green' : 'text-muted2'}`}>
                          {c.is_online ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
                        {[
                          { label: 'Робота',  val: c.job },
                          { label: 'Рівень',  val: `LVL ${c.level}` },
                          { label: 'Готівка', val: `$${c.cash.toLocaleString()}` },
                          { label: 'Банк',    val: `$${c.bank.toLocaleString()}` },
                        ].map(f => (
                          <div key={f.label} className="bg-bg p-3">
                            <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">{f.label}</div>
                            <div className="font-condensed font-black text-sm text-white">{f.val}</div>
                          </div>
                        ))}
                      </div>
                      <div className="px-5 py-2 flex items-center justify-between">
                        <span className="font-mono text-xs text-muted">{c.hours} год у грі</span>
                        <span className="font-mono text-xs text-muted2">XP: {c.xp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'settings' && (
            <>
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-4">Інформація акаунту</div>
              <div className="bg-bg2 border border-border p-4 md:p-5 flex flex-col gap-4 max-w-md mb-8">
                {[
                  { label: 'Нікнейм',        value: user.username },
                  { label: 'Email',           value: user.email },
                  { label: 'Роль',            value: user.role },
                  { label: 'Зареєстрований', value: new Date(user.created_at).toLocaleDateString('uk') },
                ].map(f => (
                  <div key={f.label}>
                    <div className="label">{f.label}</div>
                    <div className="input !cursor-default opacity-60">{f.value}</div>
                  </div>
                ))}
              </div>

              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-4">Змінити пароль</div>
              <form onSubmit={submitPw} className="bg-bg2 border border-border p-4 md:p-5 flex flex-col gap-4 max-w-md">
                <div>
                  <label className="label">Поточний пароль</label>
                  <input type="password" className="input" placeholder="••••••••"
                    value={pwForm.old_password}
                    onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))}
                    required />
                </div>
                <div>
                  <label className="label">Новий пароль</label>
                  <input type="password" className="input" placeholder="Мінімум 8 символів"
                    value={pwForm.new_password}
                    onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                    minLength={8} required />
                </div>
                <div>
                  <label className="label">Підтвердження паролю</label>
                  <input type="password" className="input" placeholder="Повторіть новий пароль"
                    value={pwForm.confirm}
                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                    required />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-cyan !px-8" disabled={pwLoading}>
                    {pwLoading ? 'Збереження...' : 'Змінити пароль'}
                  </button>
                </div>
              </form>

              <div className="mt-6 md:hidden">
                <button onClick={logout} className="btn-ghost !text-red !border-red/30 hover:!border-red w-full !h-11">
                  Вийти з акаунту
                </button>
              </div>
            </>
          )}

          {tab === 'news' && user.role === 'admin' && (
            <>
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-4">Управління новинами</div>
              <form onSubmit={submitNews} className="bg-bg2 border border-border p-5 mb-6 flex flex-col gap-4">
                <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase">Нова новина</div>
                <div>
                  <label className="label">Заголовок</label>
                  <input className="input" placeholder="Заголовок новини..."
                    value={newForm.title}
                    onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))}
                    maxLength={120} required />
                </div>
                <div>
                  <label className="label">Текст</label>
                  <textarea className="input resize-none" rows={5} placeholder="Опишіть оновлення, подію або новину..."
                    value={newForm.body}
                    onChange={e => setNewForm(f => ({ ...f, body: e.target.value }))}
                    required />
                </div>
                <div>
                  <label className="label">Зображення URL (необов'язково)</label>
                  <input className="input" placeholder="https://example.com/image.jpg"
                    value={newForm.image_url}
                    onChange={e => setNewForm(f => ({ ...f, image_url: e.target.value }))} />
                  <div className="font-mono text-xs text-muted2 mt-1">Пряме посилання на зображення (.jpg, .png, .webp)</div>
                </div>
                <div>
                  <label className="label">Відео URL (необов'язково)</label>
                  <input className="input" placeholder="https://example.com/video.mp4"
                    value={newForm.video_url}
                    onChange={e => setNewForm(f => ({ ...f, video_url: e.target.value }))} />
                  <div className="font-mono text-xs text-muted2 mt-1">Пряме посилання на відеофайл (.mp4, .webm)</div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-cyan !px-8" disabled={posting}>
                    {posting ? 'Публікую...' : 'Опублікувати'}
                  </button>
                </div>
              </form>

              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">
                Опубліковані новини ({news.length})
              </div>
              <div className="flex flex-col gap-3">
                {news.length === 0 && (
                  <div className="bg-bg2 border border-border p-6 text-center font-mono text-sm text-muted">Новин ще немає</div>
                )}
                {news.map(n => (
                  <div key={n.id} className="bg-bg2 border border-border overflow-hidden">
                    {n.image_url && (
                      <div className="border-b border-border">
                        <img src={n.image_url} alt={n.title} className="w-full max-h-48 object-cover" />
                      </div>
                    )}
                    {!n.image_url && n.video_url && (
                      <div className="border-b border-border bg-black">
                        <video src={n.video_url} className="w-full max-h-48 object-contain" controls muted playsInline preload="metadata" />
                      </div>
                    )}
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="font-condensed font-black text-base uppercase tracking-wide flex-1">{n.title}</div>
                        <button
                          onClick={() => deleteNews(n.id)}
                          className="flex-shrink-0 font-mono text-xs text-red/60 hover:text-red transition-colors border border-red/20 hover:border-red/40 px-2 py-1 rounded-sm"
                        >Видалити</button>
                      </div>
                      <div className="font-body text-sm text-muted leading-relaxed line-clamp-2 mb-2">{n.body}</div>
                      <div className="font-mono text-xs text-muted2">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: uk })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'players' && ['admin', 'moderator'].includes(user.role) && (
            <>
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase">
                  Управління гравцями
                  {userTotal > 0 && <span className="text-muted2 ml-2">({userTotal})</span>}
                </div>
                <input
                  className="input !w-48 !py-1.5 !text-xs"
                  placeholder="Пошук по ніку..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-px bg-border mb-4">
                {usersLoading && (
                  <div className="bg-bg2 p-6 text-center font-mono text-sm text-muted animate-pulse">Завантаження...</div>
                )}
                {!usersLoading && adminUsers.length === 0 && (
                  <div className="bg-bg2 p-6 text-center font-mono text-sm text-muted">Нікого не знайдено</div>
                )}
                {!usersLoading && adminUsers.map(u => {
                  const banned = isForumBanned(u.forum_banned_until)
                  const banSel = forumBanSelects[u.id] ?? '1'
                  return (
                    <div key={u.id} className={`bg-bg2 px-4 py-3 flex flex-col gap-2.5 ${!u.is_active ? 'opacity-50' : ''}`}>
                      {/* Row 1: identity + account ban */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-condensed font-black text-sm uppercase tracking-wide">{u.username}</span>
                            <span className={`font-mono text-[10px] font-bold tracking-widest ${roleColors[u.role] || 'text-muted'}`}>
                              {u.role.toUpperCase()}
                            </span>
                            {!u.is_active && (
                              <span className="font-mono text-[10px] font-bold text-red tracking-widest px-1.5 border border-red/30 rounded">БАН</span>
                            )}
                            {banned && (
                              <span className="font-mono text-[10px] font-bold text-orange tracking-widest px-1.5 border border-orange/30 rounded">
                                ФОРУМ-БАН {forumBanLabel(u.forum_banned_until)}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xs text-muted2">{u.email}</div>
                        </div>
                        {/* Account controls — admin only */}
                        {user.role === 'admin' && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <select
                              value={u.role}
                              onChange={e => changeRole(u.id, e.target.value)}
                              className="bg-bg3 border border-border text-white font-mono text-xs px-2 py-1.5 outline-none focus:border-cyan rounded-md"
                            >
                              <option value="player">player</option>
                              <option value="moderator">moderator</option>
                              <option value="admin">admin</option>
                            </select>
                            <button
                              onClick={() => toggleBan(u.id, u.is_active)}
                              className={`font-mono text-[10px] font-bold tracking-widest px-2 py-1.5 border transition-colors rounded-md ${
                                u.is_active
                                  ? 'border-red/20 text-red/60 hover:border-red/50 hover:text-red'
                                  : 'border-green/30 text-green hover:border-green/60'
                              }`}
                            >
                              {u.is_active ? 'БАН' : 'РОЗБАН'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Row 2: forum ban — admin + moderator, skip admins */}
                      {u.role !== 'admin' && (
                        <div className="flex items-center gap-2 flex-wrap pl-0">
                          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Форум-бан:</span>
                          {banned ? (
                            <button
                              onClick={() => removeForumBan(u.id, u.username)}
                              className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 border border-green/30 text-green hover:border-green transition-colors rounded-md"
                            >
                              ✓ Зняти бан
                            </button>
                          ) : (
                            <>
                              <select
                                value={banSel}
                                onChange={e => setForumBanSelects(prev => ({ ...prev, [u.id]: e.target.value }))}
                                className="bg-bg3 border border-border text-white font-mono text-[10px] px-2 py-1 outline-none focus:border-cyan rounded-md"
                              >
                                {BAN_DURATIONS.map(d => (
                                  <option key={String(d.hours)} value={String(d.hours)}>{d.label}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => applyForumBan(u.id, u.username)}
                                className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 border border-orange/30 text-orange/70 hover:border-orange hover:text-orange transition-colors rounded-md"
                              >
                                Забанити
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {Math.ceil(userTotal / USER_LIMIT) > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    disabled={userPage === 1}
                    onClick={() => { const p = userPage - 1; setUserPage(p); loadUsers(userSearch, p) }}
                    className="btn-ghost disabled:opacity-30 !px-3 !h-8"
                  >←</button>
                  {Array.from({ length: Math.ceil(userTotal / USER_LIMIT) }, (_, i) => i + 1).map(pg => (
                    <button
                      key={pg}
                      onClick={() => { setUserPage(pg); loadUsers(userSearch, pg) }}
                      className={`w-8 h-8 font-mono text-xs font-bold rounded-lg transition-all ${
                        pg === userPage
                          ? 'text-white'
                          : 'border border-border text-muted hover:border-border2 hover:text-white bg-transparent'
                      }`}
                      style={pg === userPage ? { background: 'linear-gradient(135deg,#F72585,#7B2FBE)' } : {}}
                    >{pg}</button>
                  ))}
                  <button
                    disabled={userPage === Math.ceil(userTotal / USER_LIMIT)}
                    onClick={() => { const p = userPage + 1; setUserPage(p); loadUsers(userSearch, p) }}
                    className="btn-ghost disabled:opacity-30 !px-3 !h-8"
                  >→</button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
