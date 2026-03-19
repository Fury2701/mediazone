import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { forumApi } from '../api/client'
import useAuthStore from '../hooks/useAuth'
import { formatDistanceToNow, format } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'

function AuthorCard({ username, role, size = 'sm' }) {
  const initials = username.slice(0, 2).toUpperCase()
  const roleColor = role === 'admin' ? 'text-red' : role === 'moderator' ? 'text-orange' : 'text-cyan'
  const roleLabel = role === 'admin' ? 'ADMIN' : role === 'moderator' ? 'MODER' : 'PLAYER'
  return (
    <div className="flex items-center gap-2">
      <div className={`${size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'} bg-bg3 border border-border flex items-center justify-center font-condensed font-black text-cyan flex-shrink-0`}>
        {initials}
      </div>
      <div>
        <div className={`font-condensed font-black uppercase tracking-wide ${size === 'lg' ? 'text-base' : 'text-sm'}`}>{username}</div>
        <div className={`font-mono text-[10px] font-bold tracking-widest ${roleColor}`}>{roleLabel}</div>
      </div>
    </div>
  )
}

export default function ForumPost() {
  const { id } = useParams()
  const [post, setPost]       = useState(null)
  const [replies, setReplies] = useState([])
  const [body, setBody]       = useState('')
  const [sending, setSending] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    forumApi.post(id).then(r => setPost(r.data)).catch(() => navigate('/forum'))
    forumApi.replies(id).then(r => setReplies(r.data)).catch(() => {})
  }, [id])

  const submit = async e => {
    e.preventDefault()
    if (!body.trim()) return
    try {
      setSending(true)
      await forumApi.createReply(id, { body })
      setBody('')
      const r = await forumApi.replies(id)
      setReplies(r.data)
      toast.success('Відповідь додано!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    } finally {
      setSending(false)
    }
  }

  if (!post) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="font-mono text-xs text-muted animate-pulse">Завантаження...</div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10">
      <button onClick={() => navigate('/forum')}
        className="font-mono text-xs text-muted hover:text-cyan mb-6 flex items-center gap-2 transition-colors group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span>Назад до форуму</span>
      </button>

      {/* Main post */}
      <div className="bg-bg2 border border-border mb-1">
        <div className="px-4 md:px-6 pt-5 pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-condensed font-black text-2xl md:text-3xl uppercase tracking-wide leading-tight mb-3">{post.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                {post.is_pinned && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-cyan/10 text-cyan border border-cyan/25 tracking-widest">📌 ЗАКРІПЛЕНО</span>
                )}
                <span className="font-mono text-xs text-muted">{format(new Date(post.created_at), 'dd.MM.yyyy HH:mm')}</span>
                <span className="font-mono text-xs text-muted">👁 {post.views}</span>
                <span className="font-mono text-xs text-muted">💬 {replies.length}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="font-mono text-[10px] text-muted2 mb-1">Автор</div>
              <AuthorCard username={post.author.username} role={post.author.role} size="lg" />
            </div>
          </div>
        </div>
        <div className="px-4 md:px-6 py-5">
          <div className="font-body text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{post.body}</div>
        </div>
        <div className="px-4 md:px-6 py-3 border-t border-border bg-bg3/30 font-mono text-xs text-muted2">
          #1 · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: uk })}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-1 flex flex-col gap-px bg-border mb-1">
          {replies.map((r, i) => (
            <div key={r.id} className="bg-bg2 flex">
              <div className="w-1 bg-border flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="px-4 md:px-5 pt-4 pb-3 border-b border-border flex items-center justify-between gap-4">
                  <AuthorCard username={r.author.username} role={r.author.role} />
                  <div className="font-mono text-xs text-muted2 text-right flex-shrink-0">
                    <div>#{i + 2}</div>
                    <div>{format(new Date(r.created_at), 'dd.MM HH:mm')}</div>
                  </div>
                </div>
                <div className="px-4 md:px-5 py-4">
                  <div className="font-body text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{r.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs text-muted2 px-2">{replies.length} відповідей</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Reply form */}
      {user ? (
        <div className="bg-bg2 border border-border">
          <div className="px-4 md:px-5 py-3 border-b border-border flex items-center gap-3">
            <AuthorCard username={user.username} role={user.role} />
            <span className="font-mono text-xs text-muted ml-auto">Ваша відповідь</span>
          </div>
          <form onSubmit={submit} className="p-4 md:p-5">
            <textarea
              className="input resize-none w-full mb-3"
              rows={5}
              placeholder="Напишіть відповідь..."
              value={body}
              onChange={e => setBody(e.target.value)}
              required
            />
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-muted2">{body.length} символів</div>
              <button type="submit" className="btn-cyan" disabled={sending}>
                {sending ? 'Надсилання...' : 'Відповісти →'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-bg2 border border-border p-6 text-center">
          <div className="font-condensed font-black text-lg text-muted2 mb-1">Увійдіть щоб відповісти</div>
          <div className="font-mono text-xs text-muted">Тільки зареєстровані гравці можуть писати на форумі</div>
        </div>
      )}
    </div>
  )
}
