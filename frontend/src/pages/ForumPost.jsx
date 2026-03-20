import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { forumApi, adminApi } from '../api/client'
import useAuthStore from '../hooks/useAuth'
import { formatDistanceToNow, format } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

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
  return `до ${format(d, 'dd.MM.yyyy HH:mm')}`
}

function ForumBanPopover({ targetId, targetUsername, onDone, onClose }) {
  const [duration, setDuration] = useState('1')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    const hours = duration === 'null' ? null : parseInt(duration)
    try {
      setLoading(true)
      await adminApi.forumBan(targetId, hours)
      toast.success(`${targetUsername} заблоковано на форумі`)
      onDone()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <select
        value={duration}
        onChange={e => setDuration(e.target.value)}
        className="bg-bg3 border border-border text-white font-mono text-[10px] px-2 py-1 outline-none focus:border-cyan rounded-md"
      >
        {BAN_DURATIONS.map(d => (
          <option key={String(d.hours)} value={String(d.hours)}>{d.label}</option>
        ))}
      </select>
      <button
        onClick={handle}
        disabled={loading}
        className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 border border-orange/40 text-orange hover:border-orange hover:bg-orange/10 transition-colors rounded-md disabled:opacity-50"
      >
        {loading ? '...' : 'Забанити'}
      </button>
      <button
        onClick={onClose}
        className="font-mono text-[10px] text-muted hover:text-white transition-colors px-1"
      >✕</button>
    </div>
  )
}

function AuthorCard({ author, size = 'sm' }) {
  const initials  = author.username.slice(0, 2).toUpperCase()
  const roleColor = author.role === 'admin' ? 'text-red' : author.role === 'moderator' ? 'text-orange' : 'text-cyan'
  const roleLabel = author.role === 'admin' ? 'ADMIN' : author.role === 'moderator' ? 'MODER' : 'PLAYER'
  return (
    <div className="flex items-center gap-2">
      <div className={`${size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'} bg-bg3 border border-border flex items-center justify-center font-condensed font-black text-cyan flex-shrink-0`}>
        {initials}
      </div>
      <div>
        <div className={`font-condensed font-black uppercase tracking-wide ${size === 'lg' ? 'text-base' : 'text-sm'}`}>{author.username}</div>
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
  const [banPanelId, setBanPanelId] = useState(null) // 'post' | replyId
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const replyRef = useRef(null)

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

  const handleDeletePost = async () => {
    if (!window.confirm('Видалити цей пост?')) return
    try {
      await forumApi.deletePost(id)
      toast.success('Пост видалено')
      navigate('/forum')
    } catch {
      toast.error('Помилка')
    }
  }

  const handlePinPost = async () => {
    try {
      const r = await forumApi.pinPost(id)
      setPost(r.data)
      toast.success(r.data.is_pinned ? 'Закріплено' : 'Відкріплено')
    } catch {
      toast.error('Помилка')
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Видалити відповідь?')) return
    try {
      await forumApi.deleteReply(id, replyId)
      setReplies(prev => prev.filter(r => r.id !== replyId))
      toast.success('Видалено')
    } catch {
      toast.error('Помилка')
    }
  }

  const handleUnforumBan = async (targetId, targetUsername) => {
    try {
      await adminApi.forumBan(targetId, 0)
      toast.success(`${targetUsername} розблоковано на форумі`)
    } catch {
      toast.error('Помилка')
    }
  }

  const insertMd = (before, after = before) => {
    const el = replyRef.current
    if (!el) return
    const start = el.selectionStart
    const end   = el.selectionEnd
    const val   = el.value
    const sel   = val.slice(start, end) || 'текст'
    const next  = val.slice(0, start) + before + sel + after + val.slice(end)
    setBody(next)
    setTimeout(() => {
      el.setSelectionRange(start + before.length, start + before.length + sel.length)
      el.focus()
    }, 0)
  }

  const canModerate = user && (user.role === 'admin' || user.role === 'moderator')
  const canDeletePost = user && (canModerate || user.id === post?.author?.id)
  const myForumBan = user && isForumBanned(user.forum_banned_until)
  const myBanLabel = user && forumBanLabel(user.forum_banned_until)

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
            <div className="flex-1 min-w-0">
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
              <AuthorCard author={post.author} size="lg" />
            </div>
          </div>

          {/* Mod actions */}
          {(canModerate || canDeletePost) && (
            <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                {canModerate && (
                  <button onClick={handlePinPost}
                    className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 border border-border hover:border-border2 text-muted hover:text-white transition-colors rounded-md">
                    {post.is_pinned ? '📌 Відкріпити' : '📌 Закріпити'}
                  </button>
                )}
                {canDeletePost && (
                  <button onClick={handleDeletePost}
                    className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 border border-red/20 hover:border-red/50 text-red/60 hover:text-red transition-colors rounded-md">
                    🗑 Видалити пост
                  </button>
                )}
                {canModerate && post.author.role === 'player' && (
                  isForumBanned(post.author.forum_banned_until) ? (
                    <button
                      onClick={() => handleUnforumBan(post.author.id, post.author.username)}
                      className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 border border-green/30 text-green hover:border-green transition-colors rounded-md"
                    >
                      ✓ Розбанити на форумі
                    </button>
                  ) : (
                    banPanelId === 'post' ? (
                      <ForumBanPopover
                        targetId={post.author.id}
                        targetUsername={post.author.username}
                        onDone={() => setBanPanelId(null)}
                        onClose={() => setBanPanelId(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setBanPanelId('post')}
                        className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 border border-orange/30 text-orange/70 hover:border-orange hover:text-orange transition-colors rounded-md"
                      >
                        🚫 Форум-бан
                      </button>
                    )
                  )
                )}
              </div>
              {canModerate && isForumBanned(post.author.forum_banned_until) && (
                <div className="font-mono text-[10px] text-orange/70">
                  {post.author.username} заблоковано на форумі {forumBanLabel(post.author.forum_banned_until)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video */}
        {post.video_url && (
          <div className="border-b border-border bg-black">
            <video
              src={post.video_url}
              className="w-full max-h-[480px] object-contain"
              controls muted playsInline preload="metadata"
            />
          </div>
        )}

        {/* Body */}
        <div className="px-4 md:px-6 py-5">
          <div className="markdown">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>
        </div>
        <div className="px-4 md:px-6 py-3 border-t border-border bg-bg3/30 font-mono text-xs text-muted2">
          #1 · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: uk })}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-1 flex flex-col gap-px bg-border mb-1">
          {replies.map((r, i) => {
            const canDelReply = user && (canModerate || user.id === r.author.id)
            const replyBanned = isForumBanned(r.author.forum_banned_until)
            return (
              <div key={r.id} className="bg-bg2 flex">
                <div className="w-1 bg-border flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="px-4 md:px-5 pt-4 pb-3 border-b border-border">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <AuthorCard author={r.author} />
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {canDelReply && (
                          <button onClick={() => handleDeleteReply(r.id)}
                            className="font-mono text-[10px] text-red/50 hover:text-red transition-colors">
                            🗑
                          </button>
                        )}
                        <div className="font-mono text-xs text-muted2 text-right">
                          <div>#{i + 2}</div>
                          <div>{format(new Date(r.created_at), 'dd.MM HH:mm')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Reply mod actions */}
                    {canModerate && r.author.role === 'player' && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1.5 flex-wrap">
                          {replyBanned ? (
                            <button
                              onClick={() => handleUnforumBan(r.author.id, r.author.username)}
                              className="font-mono text-[10px] font-bold tracking-widest px-2 py-0.5 border border-green/30 text-green hover:border-green transition-colors rounded-md"
                            >
                              ✓ Розбанити на форумі
                            </button>
                          ) : (
                            banPanelId === r.id ? (
                              <ForumBanPopover
                                targetId={r.author.id}
                                targetUsername={r.author.username}
                                onDone={() => setBanPanelId(null)}
                                onClose={() => setBanPanelId(null)}
                              />
                            ) : (
                              <button
                                onClick={() => setBanPanelId(r.id)}
                                className="font-mono text-[10px] font-bold tracking-widest px-2 py-0.5 border border-orange/30 text-orange/70 hover:border-orange hover:text-orange transition-colors rounded-md"
                              >
                                🚫 Форум-бан
                              </button>
                            )
                          )}
                        </div>
                        {replyBanned && (
                          <div className="font-mono text-[10px] text-orange/60">
                            {r.author.username} заблоковано {forumBanLabel(r.author.forum_banned_until)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-4 md:px-5 py-4">
                    <div className="markdown">
                      <ReactMarkdown>{r.body}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs text-muted2 px-2">{replies.length} відповідей</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Reply form */}
      {user ? (
        myForumBan ? (
          <div className="bg-bg2 border border-orange/30 p-6 text-center rounded-xl">
            <div className="font-condensed font-black text-lg text-orange mb-1">🚫 Ви заблоковані на форумі</div>
            <div className="font-mono text-xs text-muted">{myBanLabel}</div>
          </div>
        ) : (
          <div className="bg-bg2 border border-border">
            <div className="px-4 md:px-5 py-3 border-b border-border flex items-center gap-3">
              <AuthorCard author={user} />
              <span className="font-mono text-xs text-muted ml-auto">Ваша відповідь</span>
            </div>
            <form onSubmit={submit} className="p-4 md:p-5">
              <div className="flex gap-1 mb-1.5">
                {[
                  { label: 'B', fn: () => insertMd('**') },
                  { label: 'I', fn: () => insertMd('*') },
                  { label: '🖼', fn: () => insertMd('![', '](url)') },
                ].map(b => (
                  <button key={b.label} type="button"
                    onClick={b.fn}
                    className="w-7 h-7 bg-bg3 border border-border text-white font-bold text-xs hover:border-border2 transition-colors"
                  >{b.label}</button>
                ))}
              </div>
              <textarea
                ref={replyRef}
                className="input resize-none w-full mb-3"
                rows={5}
                placeholder="Напишіть відповідь... (підтримується Markdown)"
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
        )
      ) : (
        <div className="bg-bg2 border border-border p-6 text-center">
          <div className="font-condensed font-black text-lg text-muted2 mb-1">Увійдіть щоб відповісти</div>
          <div className="font-mono text-xs text-muted">Тільки зареєстровані гравці можуть писати на форумі</div>
        </div>
      )}
    </div>
  )
}
