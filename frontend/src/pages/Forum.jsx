import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { forumApi } from '../api/client'
import useAuthStore from '../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'

const LIMIT = 20

export default function Forum() {
  const [categories, setCategories] = useState([])
  const [posts, setPosts]           = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [activeCat, setActiveCat]   = useState(null)
  const [myOnly, setMyOnly]         = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [newPost, setNewPost]       = useState({ title: '', body: '', category_id: '' })
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const bodyRef = useRef(null)

  useEffect(() => {
    forumApi.categories().then(r => setCategories(r.data)).catch(() => {})
    loadPosts(null, false, 1)
  }, [])

  const loadPosts = (catId, mine, pg) => {
    const params = { limit: LIMIT, skip: (pg - 1) * LIMIT }
    if (catId) params.category_id = catId
    if (mine && user) params.author_username = user.username
    forumApi.posts(params).then(r => {
      setPosts(r.data.items)
      setTotal(r.data.total)
    }).catch(() => {})
  }

  const selectCat = (id) => {
    setActiveCat(id)
    setPage(1)
    loadPosts(id, myOnly, 1)
  }

  const toggleMy = () => {
    const next = !myOnly
    setMyOnly(next)
    setPage(1)
    loadPosts(activeCat, next, 1)
  }

  const goPage = (pg) => {
    setPage(pg)
    loadPosts(activeCat, myOnly, pg)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const insertMd = (before, after = before) => {
    const el = bodyRef.current
    if (!el) return
    const start = el.selectionStart
    const end   = el.selectionEnd
    const val   = el.value
    const sel   = val.slice(start, end) || 'текст'
    const next  = val.slice(0, start) + before + sel + after + val.slice(end)
    setNewPost(f => ({ ...f, body: next }))
    setTimeout(() => {
      el.setSelectionRange(start + before.length, start + before.length + sel.length)
      el.focus()
    }, 0)
  }

  const submit = async e => {
    e.preventDefault()
    try {
      await forumApi.createPost({ ...newPost, category_id: Number(newPost.category_id) })
      toast.success('Тему створено!')
      setShowNew(false)
      setNewPost({ title: '', body: '', category_id: '' })
      setPage(1)
      loadPosts(activeCat, myOnly, 1)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    }
  }

  const activeCatObj = categories.find(c => c.id === activeCat)
  const totalPages   = Math.ceil(total / LIMIT)

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-2">Спільнота</div>
          <h1 className="font-display text-5xl md:text-6xl uppercase">Форум</h1>
        </div>
        {user && (
          <button className="btn-cyan !text-sm" onClick={() => setShowNew(true)}>+ Нова тема</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5">
        <div>
          {/* Categories + My filter */}
          <div className="mb-5">
            <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Розділи</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-border mb-3">
              <div
                onClick={() => selectCat(null)}
                className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors border-l-2
                  ${!activeCat && !myOnly ? 'bg-bg3 border-cyan' : 'bg-bg2 border-transparent hover:bg-bg3'}`}
              >
                <span className="text-base">📋</span>
                <div className="min-w-0">
                  <div className="font-condensed font-bold text-xs uppercase tracking-wide truncate">Всі теми</div>
                  <div className="font-mono text-[10px] text-muted">{total}</div>
                </div>
              </div>
              {categories.map(c => (
                <div key={c.id}
                  onClick={() => selectCat(c.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors border-l-2
                    ${activeCat === c.id ? 'bg-bg3 border-cyan' : 'bg-bg2 border-transparent hover:bg-bg3'}`}
                >
                  <span className="text-base flex-shrink-0">{c.icon}</span>
                  <div className="min-w-0">
                    <div className="font-condensed font-bold text-xs uppercase tracking-wide truncate">{c.name}</div>
                    <div className="font-mono text-[10px] text-muted">{c.post_count}</div>
                  </div>
                </div>
              ))}
            </div>

            {user && (
              <button
                onClick={toggleMy}
                className={`flex items-center gap-2 px-3 py-2 font-mono text-xs font-bold tracking-widest uppercase transition-all border rounded-sm ${
                  myOnly
                    ? 'bg-cyan/10 border-cyan text-cyan'
                    : 'bg-bg2 border-border text-muted hover:border-border2 hover:text-white'
                }`}
              >
                <span>{myOnly ? '✓' : '○'}</span>
                <span>Мої теми</span>
              </button>
            )}
          </div>

          {/* Posts list */}
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase">
              {myOnly ? 'Мої теми' : activeCatObj ? activeCatObj.name : 'Всі теми'}
            </div>
            <div className="font-mono text-xs text-muted2">{total} записів</div>
          </div>

          <div className="flex flex-col gap-px bg-border">
            {posts.length === 0 && (
              <div className="bg-bg2 px-5 py-12 text-center">
                <div className="font-condensed font-black text-xl text-muted2 mb-3">
                  {myOnly ? 'Ви ще не створювали тем' : 'Постів ще немає'}
                </div>
                {!myOnly && user && (
                  <button className="btn-cyan !text-xs !h-8 !px-4" onClick={() => setShowNew(true)}>Створити першу тему</button>
                )}
              </div>
            )}
            {posts.map(p => {
              const cat = categories.find(c => c.id === p.category_id)
              return (
                <div key={p.id}
                  onClick={() => navigate(`/forum/${p.id}`)}
                  className="bg-bg2 hover:bg-bg3 px-4 md:px-5 py-4 flex items-start gap-3 md:gap-4 cursor-pointer transition-colors group"
                >
                  <div className="w-9 h-9 bg-bg3 border border-border flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                    {cat?.icon ?? '💬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {p.is_pinned && (
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-cyan/10 text-cyan border border-cyan/25 tracking-widest">PIN</span>
                      )}
                    </div>
                    <div className="font-condensed font-bold text-sm md:text-base tracking-wide group-hover:text-cyan transition-colors mb-1 truncate">
                      {p.title}
                    </div>
                    <div className="font-mono text-xs text-muted">
                      <span className="text-white/60">{p.author.username}</span>
                      <span className="mx-1">·</span>
                      {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: uk })}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right flex flex-col gap-1">
                    <div className="flex items-center gap-1 justify-end text-muted font-mono text-xs">
                      <span>💬</span><span>{p.reply_count}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end text-muted2 font-mono text-xs">
                      <span>👁</span><span>{p.views}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4 py-4">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
              >← Назад</button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button key={pg}
                    onClick={() => goPage(pg)}
                    className={`w-8 h-8 font-mono text-xs transition-colors ${
                      pg === page
                        ? 'bg-cyan text-white'
                        : 'bg-bg2 border border-border text-muted hover:border-border2 hover:text-white'
                    }`}
                  >{pg}</button>
                ))}
              </div>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page === totalPages}
                className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
              >Далі →</button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-bg2 border border-border">
            <div className="px-4 py-2.5 border-b border-border font-mono text-xs font-bold tracking-widest text-muted uppercase">Статус сервера</div>
            <div className="p-4 flex flex-col">
              {[
                ['СТАТУС',    <span key="s" className="text-green font-bold">● ONLINE</span>],
                ['ПЛАТФОРМА', 'FiveM'],
                ['АПТАЙМ',    <span key="u" className="text-green">99.9%</span>],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-border last:border-none">
                  <span className="font-mono text-xs text-muted">{k}</span>
                  <span className="font-mono text-xs font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg2 border border-border">
            <div className="px-4 py-2.5 border-b border-border font-mono text-xs font-bold tracking-widest text-muted uppercase">Правила форуму</div>
            <ul className="p-4 flex flex-col gap-2">
              {['Поважай інших гравців', 'Не флуди та не спамь', 'Теми — тільки по темі розділу', 'РП нік: Name_Surname', 'Заборонені мат та образи'].map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-cyan mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-body text-xs text-muted leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* New post modal */}
      {showNew && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4"
          onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="bg-bg2 border border-border2 w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-border sticky top-0 bg-bg2 z-10">
              <h2 className="font-display text-2xl uppercase tracking-wider">Нова тема</h2>
              <button onClick={() => setShowNew(false)} className="text-muted hover:text-white text-xl p-1">✕</button>
            </div>
            <form onSubmit={submit} className="p-5 md:p-6 flex flex-col gap-4">
              <div>
                <label className="label">Розділ</label>
                <select className="input" value={newPost.category_id}
                  onChange={e => setNewPost(f => ({ ...f, category_id: e.target.value }))} required>
                  <option value="">— Оберіть розділ —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Заголовок теми</label>
                <input className="input" placeholder="Чітко та зрозуміло опишіть тему..."
                  value={newPost.title}
                  onChange={e => setNewPost(f => ({ ...f, title: e.target.value }))}
                  maxLength={120} required />
                <div className="text-right font-mono text-xs text-muted2 mt-1">{newPost.title.length}/120</div>
              </div>
              <div>
                <label className="label">Текст</label>
                <div className="flex gap-1 mb-1.5">
                  {[
                    { label: 'B', title: 'Жирний', fn: () => insertMd('**') },
                    { label: 'I', title: 'Курсив',  fn: () => insertMd('*') },
                    { label: '🖼', title: 'Зображення', fn: () => insertMd('![', '](url)') },
                  ].map(b => (
                    <button key={b.label} type="button" title={b.title}
                      onClick={b.fn}
                      className="w-7 h-7 bg-bg3 border border-border text-white font-bold text-xs hover:border-border2 transition-colors"
                    >{b.label}</button>
                  ))}
                  <span className="font-mono text-[10px] text-muted2 ml-2 self-center">Підтримується Markdown</span>
                </div>
                <textarea ref={bodyRef} className="input resize-none" rows={7} placeholder="Детально опишіть свою думку або питання..."
                  value={newPost.body}
                  onChange={e => setNewPost(f => ({ ...f, body: e.target.value }))}
                  required />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-ghost" onClick={() => setShowNew(false)}>Скасувати</button>
                <button type="submit" className="btn-cyan px-8">Опублікувати</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
