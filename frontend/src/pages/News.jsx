import { useEffect, useState } from 'react'
import { newsApi } from '../api/client'
import { formatDistanceToNow, format } from 'date-fns'
import { uk } from 'date-fns/locale'

const LIMIT = 10

export default function News() {
  const [news, setNews]   = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews(1)
  }, [])

  const loadNews = async (pg) => {
    setLoading(true)
    try {
      const r = await newsApi.list({ limit: LIMIT, skip: (pg - 1) * LIMIT })
      // API returns array; total from header or just length
      setNews(r.data)
      setTotal(r.data.length < LIMIT && pg === 1 ? r.data.length : total)
    } catch {
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / LIMIT) || 1

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-2">Медіа</div>
      <h1 className="font-display text-5xl md:text-6xl uppercase mb-10">Новини</h1>

      {loading && (
        <div className="text-center py-20 font-mono text-xs text-muted animate-pulse">Завантаження...</div>
      )}

      {!loading && news.length === 0 && (
        <div className="bg-bg2 border border-border p-12 text-center">
          <div className="text-4xl mb-4">📰</div>
          <div className="font-condensed font-black text-2xl text-muted2 mb-2">Новин ще немає</div>
          <div className="font-mono text-xs text-muted">Слідкуйте за оновленнями сервера</div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {news.map(n => (
          <article key={n.id} className="bg-bg2 border border-border overflow-hidden">
            {n.video_url && (
              <div className="bg-black border-b border-border">
                <video
                  src={n.video_url}
                  className="w-full max-h-[480px] object-contain"
                  controls muted playsInline preload="metadata"
                />
              </div>
            )}
            <div className="p-5 md:p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="font-condensed font-black text-xl md:text-2xl uppercase tracking-wide leading-tight flex-1">
                  {n.title}
                </h2>
                <span className="tag bg-cyan/10 text-cyan border border-cyan/25 flex-shrink-0 mt-1">NEWS</span>
              </div>
              <div className="font-body text-sm text-white/80 leading-relaxed mb-4 whitespace-pre-wrap">{n.body}</div>
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <div className="w-6 h-6 bg-bg3 border border-border flex items-center justify-center font-condensed font-black text-[10px] text-cyan flex-shrink-0">
                  {n.author.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="font-mono text-xs text-muted flex-1">
                  <span className="text-white/60">{n.author.username.toUpperCase()}</span>
                  <span className="mx-2">·</span>
                  {format(new Date(n.created_at), 'dd.MM.yyyy HH:mm')}
                </div>
                <span className="font-mono text-xs text-muted2">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: uk })}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => { setPage(p => p - 1); loadNews(page - 1) }}
            disabled={page === 1}
            className="btn-ghost disabled:opacity-30"
          >← Назад</button>
          <span className="font-mono text-xs text-muted">{page} / {totalPages}</span>
          <button
            onClick={() => { setPage(p => p + 1); loadNews(page + 1) }}
            disabled={page === totalPages}
            className="btn-ghost disabled:opacity-30"
          >Далі →</button>
        </div>
      )}
    </div>
  )
}
