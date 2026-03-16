// ForumPost.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { forumApi } from '../api/client'
import useAuthStore from '../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'

export function ForumPost() {
  const { id } = useParams()
  const [post, setPost]     = useState(null)
  const [replies, setReplies] = useState([])
  const [body, setBody]     = useState('')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    forumApi.post(id).then(r => setPost(r.data)).catch(() => navigate('/forum'))
    forumApi.replies(id).then(r => setReplies(r.data)).catch(() => {})
  }, [id])

  const submit = async e => {
    e.preventDefault()
    try {
      await forumApi.createReply(id, { body })
      setBody('')
      const r = await forumApi.replies(id)
      setReplies(r.data)
      toast.success('Відповідь додано!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Помилка')
    }
  }

  if (!post) return <div className="max-w-4xl mx-auto px-6 py-20 text-center font-mono text-muted">Завантаження...</div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button onClick={() => navigate('/forum')} className="font-mono text-xs text-muted hover:text-cyan mb-6 flex items-center gap-2 transition-colors">
        ← Назад до форуму
      </button>
      <div className="card p-6 mb-4">
        <h1 className="font-condensed font-black text-3xl uppercase tracking-wide mb-3">{post.title}</h1>
        <div className="font-mono text-xs text-muted mb-4">
          {post.author.username.toUpperCase()} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: uk })} · {post.views} переглядів
        </div>
        <div className="font-body text-sm text-white/80 leading-relaxed whitespace-pre-wrap border-t border-border pt-4">{post.body}</div>
      </div>

      <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">{replies.length} відповідей</div>
      <div className="flex flex-col gap-px bg-border mb-6">
        {replies.map(r => (
          <div key={r.id} className="bg-bg2 px-5 py-4">
            <div className="font-mono text-xs text-cyan mb-2">{r.author.username.toUpperCase()} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: uk })}</div>
            <div className="font-body text-sm text-white/80 leading-relaxed">{r.body}</div>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={submit} className="card p-5">
          <label className="label">Ваша відповідь</label>
          <textarea className="input !h-24 resize-none mb-3" placeholder="Напишіть відповідь..." value={body} onChange={e => setBody(e.target.value)} required />
          <button type="submit" className="btn-cyan">Відповісти</button>
        </form>
      ) : (
        <div className="card p-5 text-center font-mono text-sm text-muted">Увійдіть щоб відповісти</div>
      )}
    </div>
  )
}

export default ForumPost
