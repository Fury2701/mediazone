import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forumApi } from '../api/client'
import useAuthStore from '../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Forum() {
  const [categories, setCategories] = useState([])
  const [posts, setPosts]           = useState([])
  const [activeCat, setActiveCat]   = useState(null)
  const [showNew, setShowNew]       = useState(false)
  const [newPost, setNewPost]       = useState({ title: '', body: '', category_id: '' })
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    forumApi.categories().then(r => setCategories(r.data)).catch(() => {})
    loadPosts()
  }, [])

  const loadPosts = (catId = null) => {
    const params = catId ? { category_id: catId, limit: 30 } : { limit: 30 }
    forumApi.posts(params).then(r => setPosts(r.data)).catch(() => {})
  }

  const selectCat = (id) => {
    setActiveCat(id)
    loadPosts(id)
  }

  const submit = async e => {
    e.preventDefault()
    try {
      await forumApi.createPost({ ...newPost, category_id: Number(newPost.category_id) })
      toast.success('Тему створено!')
      setShowNew(false)
      setNewPost({ title: '', body: '', category_id: '' })
      loadPosts(activeCat)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    }
  }

  const activeCatObj = categories.find(c => c.id === activeCat)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-2">Спільнота</div>
          <h1 className="font-condensed font-black text-5xl uppercase tracking-tight">Форум</h1>
        </div>
        {user && (
          <button className="btn-cyan" onClick={() => setShowNew(true)}>+ Нова тема</button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-5">
        <div>
          {/* Categories */}
          <div className="mb-6">
            <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Розділи</div>
            <div className="grid grid-cols-2 gap-px bg-border">
              <div
                onClick={() => selectCat(null)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2
                  ${!activeCat ? 'bg-bg3 border-cyan' : 'bg-bg2 border-transparent hover:bg-bg3'}`}
              >
                <span className="text-xl">📋</span>
                <div>
                  <div className="font-condensed font-bold text-sm uppercase tracking-wide">Всі теми</div>
                  <div className="font-mono text-xs text-muted">{posts.length} постів</div>
                </div>
              </div>
              {categories.map(c => (
                <div key={c.id}
                  onClick={() => selectCat(c.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2
                    ${activeCat === c.id ? 'bg-bg3 border-cyan' : 'bg-bg2 border-transparent hover:bg-bg3'}`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-condensed font-bold text-sm uppercase tracking-wide truncate">{c.name}</div>
                    <div className="font-mono text-xs text-muted">{c.post_count} тем</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Posts list */}
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase">
              {activeCatObj ? activeCatObj.name : 'Всі теми'}
            </div>
            <div className="font-mono text-xs text-muted2">{posts.length} записів</div>
          </div>

          <div className="flex flex-col gap-px bg-border">
            {posts.length === 0 && (
              <div className="bg-bg2 px-5 py-12 text-center">
                <div className="font-condensed font-black text-xl text-muted2 mb-2">Постів ще немає</div>
                {user
                  ? <button className="btn-cyan !text-xs !h-8" onClick={() => setShowNew(true)}>Створити першу тему</button>
                  : <div className="font-mono text-xs text-muted">Увійдіть щоб написати</div>
                }
              </div>
            )}
            {posts.map(p => {
              const cat = categories.find(c => c.id === p.category_id)
              return (
                <div key={p.id}
                  onClick={() => navigate(`/forum/${p.id}`)}
                  className="bg-bg2 hover:bg-bg3 px-5 py-4 flex items-start gap-4 cursor-pointer transition-colors group"
                >
                  {/* Category icon */}
                  <div className="w-10 h-10 bg-bg3 border border-border flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                    {cat?.icon ?? '💬'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {p.is_pinned && (
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-cyan/10 text-cyan border border-cyan/25 tracking-widest">PIN</span>
                      )}
                      {cat && (
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-bg3 text-muted2 border border-border2 tracking-widest uppercase">{cat.name}</span>
                      )}
                    </div>
                    <div className="font-condensed font-bold text-base tracking-wide group-hover:text-cyan transition-colors mb-1 truncate">
                      {p.title}
                    </div>
                    <div className="font-mono text-xs text-muted">
                      <span className="text-white/60">{p.author.username}</span>
                      <span className="mx-1.5">·</span>
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
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Server status */}
          <div className="bg-bg2 border border-border">
            <div className="px-4 py-2.5 border-b border-border font-mono text-xs font-bold tracking-widest text-muted uppercase">Статус сервера</div>
            <div className="p-4 flex flex-col gap-0">
              {[
                ['СТАТУС',    <span className="text-green font-bold">● ONLINE</span>],
                ['ПЛАТФОРМА', 'FiveM'],
                ['ІНФРА',     'K3S / ArgoCD'],
                ['АПТАЙМ',    <span className="text-green">99.9%</span>],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-border last:border-none">
                  <span className="font-mono text-xs text-muted">{k}</span>
                  <span className="font-mono text-xs font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-bg2 border border-border">
            <div className="px-4 py-2.5 border-b border-border font-mono text-xs font-bold tracking-widest text-muted uppercase">Правила форуму</div>
            <ul className="p-4 flex flex-col gap-2">
              {[
                'Поважай інших гравців',
                'Не флуди та не спамь',
                'Теми — тільки по темі розділу',
                'РП нік: формат Name_Surname',
                'Заборонені мат та образи',
                'Баги репортуй у відповідний розділ',
              ].map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-cyan mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-body text-xs text-muted leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Category list compact */}
          {categories.length > 0 && (
            <div className="bg-bg2 border border-border">
              <div className="px-4 py-2.5 border-b border-border font-mono text-xs font-bold tracking-widest text-muted uppercase">Розділи</div>
              <div className="p-2">
                {categories.map(c => (
                  <div key={c.id}
                    onClick={() => selectCat(c.id)}
                    className={`flex items-center gap-2 px-2 py-2 cursor-pointer transition-colors rounded-sm
                      ${activeCat === c.id ? 'bg-bg3 text-cyan' : 'hover:bg-bg3 text-muted'}`}
                  >
                    <span>{c.icon}</span>
                    <span className="font-mono text-xs flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-xs text-muted2">{c.post_count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New post modal */}
      {showNew && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="bg-bg2 border border-border2 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-condensed font-black text-xl uppercase tracking-wider">Нова тема</h2>
              <button onClick={() => setShowNew(false)} className="text-muted hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={submit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Розділ</label>
                  <select className="input" value={newPost.category_id}
                    onChange={e => setNewPost(f => ({ ...f, category_id: e.target.value }))} required>
                    <option value="">— Оберіть розділ —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Заголовок теми</label>
                  <input className="input" placeholder="Чітко та зрозуміло опишіть тему..."
                    value={newPost.title}
                    onChange={e => setNewPost(f => ({ ...f, title: e.target.value }))}
                    maxLength={120} required />
                  <div className="text-right font-mono text-xs text-muted2 mt-1">{newPost.title.length}/120</div>
                </div>
              </div>
              <div>
                <label className="label">Текст</label>
                <textarea className="input resize-none" rows={8} placeholder="Детально опишіть свою думку, питання або звернення..."
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
