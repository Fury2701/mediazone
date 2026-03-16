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
    const params = catId ? { category_id: catId, limit: 20 } : { limit: 20 }
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-2">Спільнота</div>
          <h1 className="font-condensed font-black text-5xl uppercase tracking-tight">Форум</h1>
        </div>
        {user && (
          <button className="btn-cyan" onClick={() => setShowNew(true)}>+ Нова тема</button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div>
          {/* Categories */}
          <div className="flex flex-col gap-px bg-border mb-6">
            <div
              onClick={() => selectCat(null)}
              className={`flex items-stretch cursor-pointer transition-colors ${!activeCat ? 'bg-bg3' : 'bg-bg2 hover:bg-bg3'}`}
            >
              <div className="w-12 flex items-center justify-center bg-bg3 border-r border-border text-lg">📋</div>
              <div className="flex-1 px-5 py-3 border-r border-border">
                <div className="font-condensed font-bold text-sm uppercase tracking-wide">Всі теми</div>
                <div className="font-body text-xs text-muted">Показати всі пости</div>
              </div>
            </div>
            {categories.map(c => (
              <div key={c.id}
                onClick={() => selectCat(c.id)}
                className={`flex items-stretch cursor-pointer transition-colors ${activeCat === c.id ? 'bg-bg3' : 'bg-bg2 hover:bg-bg3'}`}
              >
                <div className="w-12 flex items-center justify-center bg-bg3 border-r border-border text-lg">{c.icon}</div>
                <div className="flex-1 px-5 py-3 border-r border-border">
                  <div className="font-condensed font-bold text-sm uppercase tracking-wide">{c.name}</div>
                  <div className="font-body text-xs text-muted">{c.description}</div>
                </div>
                <div className="px-5 flex flex-col justify-center text-right">
                  <div className="font-condensed font-black text-xl text-cyan">{c.post_count}</div>
                  <div className="font-mono text-xs text-muted uppercase">теми</div>
                </div>
              </div>
            ))}
          </div>

          {/* Posts */}
          <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Останні теми</div>
          <div className="flex flex-col gap-px bg-border">
            {posts.length === 0 && (
              <div className="bg-bg2 px-5 py-8 text-center text-muted font-mono text-sm">Поки немає постів</div>
            )}
            {posts.map(p => (
              <div key={p.id}
                onClick={() => navigate(`/forum/${p.id}`)}
                className="bg-bg2 hover:bg-bg3 px-5 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-condensed font-bold text-base tracking-wide mb-1">{p.title}</div>
                  <div className="font-mono text-xs text-muted">
                    {p.author.username.toUpperCase()} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: uk })} · {p.views} переглядів · {p.reply_count} відповідей
                  </div>
                </div>
                {p.is_pinned && <span className="tag bg-cyan/10 text-cyan border border-cyan/25 flex-shrink-0">TOP</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          <div className="card">
            <div className="px-4 py-2.5 border-b border-border font-mono text-xs font-bold tracking-widest text-muted uppercase">Статус сервера</div>
            <div className="p-4 flex flex-col gap-2">
              {[
                ['STATUS',   <span className="text-green font-bold">ONLINE</span>],
                ['PLATFORM', 'FiveM'],
                ['INFRA',    'K3S/ArgoCD'],
                ['UPTIME',   <span className="text-green">99.9%</span>],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1.5 border-b border-border last:border-none">
                  <span className="font-mono text-xs text-muted">{k}</span>
                  <span className="font-mono text-xs font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New post modal */}
      {showNew && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="bg-bg2 border border-border2 w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-condensed font-black text-xl uppercase tracking-wider">Нова тема</h2>
              <button onClick={() => setShowNew(false)} className="text-muted hover:text-white">✕</button>
            </div>
            <form onSubmit={submit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="label">Категорія</label>
                <select className="input" value={newPost.category_id} onChange={e => setNewPost(f => ({ ...f, category_id: e.target.value }))} required>
                  <option value="">Оберіть категорію</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Заголовок</label>
                <input className="input" placeholder="Заголовок теми" value={newPost.title} onChange={e => setNewPost(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Текст</label>
                <textarea className="input !h-32 resize-none" placeholder="Текст повідомлення..." value={newPost.body} onChange={e => setNewPost(f => ({ ...f, body: e.target.value }))} required />
              </div>
              <button type="submit" className="btn-cyan w-full h-11">Опублікувати</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
