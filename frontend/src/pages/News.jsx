import { useEffect, useState, Fragment } from 'react'
import { newsApi } from '../api/client'
import { formatDistanceToNow, format } from 'date-fns'
import { uk } from 'date-fns/locale'

const LIMIT = 9

function AuthorRow({ author, createdAt, small = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${small ? '' : 'gap-3'}`}>
      <div
        className={`rounded-full flex items-center justify-center font-condensed font-black text-white flex-shrink-0 ${small ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-xs'}`}
        style={{ background: 'linear-gradient(135deg,#F72585,#7B2FBE)' }}
      >
        {author.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className={`font-condensed font-bold uppercase tracking-wide text-white/90 truncate ${small ? 'text-xs' : 'text-sm'}`}>
          {author.username}
        </div>
        <div className="font-mono text-[10px] text-muted">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: uk })}
        </div>
      </div>
    </div>
  )
}

function NewsCardFeatured({ n }) {
  const [expanded, setExpanded] = useState(false)
  const hasImage = !!n.image_url
  const hasVideo = !!n.video_url

  return (
    <article className="group relative bg-bg2 border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-border2 hover:shadow-[0_0_48px_rgba(247,37,133,0.14)]">
      {hasImage && (
        <div className="relative overflow-hidden h-64 md:h-80">
          <img
            src={n.image_url}
            alt={n.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg2 via-bg2/40 to-transparent" />
        </div>
      )}
      {!hasImage && hasVideo && (
        <div className="bg-black rounded-t-2xl overflow-hidden">
          <video
            src={n.video_url}
            className="w-full max-h-80 object-contain"
            controls muted playsInline preload="metadata"
          />
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="tag bg-cyan/15 text-cyan border border-cyan/30 !h-6 !px-3">FEATURED</span>
          <span className="font-mono text-xs text-muted2">{format(new Date(n.created_at), 'dd MMMM yyyy', { locale: uk })}</span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wide text-white mb-4 leading-tight">
          {n.title}
        </h2>
        <div className={`font-body text-sm text-white/75 leading-relaxed mb-2 whitespace-pre-wrap ${!expanded && n.body.length > 320 ? 'line-clamp-4' : ''}`}>
          {n.body}
        </div>
        {n.body.length > 320 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="font-mono text-xs text-cyan hover:opacity-75 transition-opacity mb-5 mt-1"
          >
            {expanded ? '↑ Згорнути' : '↓ Читати далі'}
          </button>
        )}
        <div className="pt-5 border-t border-border mt-4">
          <AuthorRow author={n.author} createdAt={n.created_at} />
        </div>
      </div>
    </article>
  )
}

function NewsCard({ n }) {
  const [expanded, setExpanded] = useState(false)
  const hasImage = !!n.image_url
  const hasVideo = !!n.video_url

  return (
    <article className="group bg-bg2 border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-border2 hover:shadow-[0_0_28px_rgba(247,37,133,0.09)] flex flex-col">
      {hasImage && (
        <div className="relative overflow-hidden h-44 flex-shrink-0">
          <img
            src={n.image_url}
            alt={n.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg2/60 to-transparent" />
        </div>
      )}
      {!hasImage && hasVideo && (
        <div className="bg-black rounded-t-xl overflow-hidden flex-shrink-0">
          <video
            src={n.video_url}
            className="w-full max-h-44 object-contain"
            controls muted playsInline preload="metadata"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="tag bg-cyan/10 text-cyan border border-cyan/20">NEWS</span>
          <span className="font-mono text-xs text-muted2">{format(new Date(n.created_at), 'dd.MM.yyyy')}</span>
        </div>
        <h3 className="font-condensed font-black text-lg uppercase tracking-wide text-white mb-3 leading-tight">
          {n.title}
        </h3>
        <div className={`font-body text-sm text-white/70 leading-relaxed whitespace-pre-wrap ${!expanded && n.body.length > 200 ? 'line-clamp-3' : ''}`}>
          {n.body}
        </div>
        {n.body.length > 200 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="font-mono text-xs text-cyan hover:opacity-75 transition-opacity mt-2 self-start"
          >
            {expanded ? '↑ Згорнути' : '↓ Далі'}
          </button>
        )}
        <div className="pt-4 border-t border-border mt-auto">
          <AuthorRow author={n.author} createdAt={n.created_at} small />
        </div>
      </div>
    </article>
  )
}

export default function News() {
  const [news, setNews]   = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNews(1) }, [])

  const loadNews = async (pg) => {
    setLoading(true)
    try {
      const r = await newsApi.list({ limit: LIMIT, skip: (pg - 1) * LIMIT })
      setNews(r.data)
      const ct = parseInt(r.headers['x-total-count'] || '0')
      if (ct) setTotal(ct)
      else if (r.data.length < LIMIT) setTotal((pg - 1) * LIMIT + r.data.length)
      else setTotal(prev => Math.max(prev, pg * LIMIT + 1))
    } catch {
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const goToPage = (pg) => {
    setPage(pg)
    loadNews(pg)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [featured, ...rest] = news

  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages))
    return Array.from(pages).sort((a, b) => a - b)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="relative mb-12 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-cyan flex-shrink-0" />
          <span className="font-mono text-xs font-bold tracking-widest text-cyan uppercase">Медіа</span>
        </div>
        <h1 className="font-display leading-none tracking-wide mb-4" style={{ fontSize: 'clamp(3.5rem,10vw,7rem)' }}>
          <span className="text-white">НО</span><span className="grad-text">ВИНИ</span>
        </h1>
        <p className="font-body text-muted text-sm md:text-base max-w-md">
          Останні оновлення, події та анонси сервера MediaZone
        </p>
        <div className="absolute -top-4 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F72585, transparent 70%)' }} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-28 gap-4">
          <div className="w-10 h-10 border-2 border-cyan/20 border-t-cyan rounded-full animate-spin" />
          <div className="font-mono text-xs text-muted">Завантаження...</div>
        </div>
      )}

      {/* Empty */}
      {!loading && news.length === 0 && (
        <div className="bg-bg2 border border-border rounded-2xl p-16 text-center">
          <div className="text-6xl mb-5 opacity-30">📰</div>
          <div className="font-condensed font-black text-2xl text-white mb-2">Новин ще немає</div>
          <div className="font-mono text-xs text-muted mt-1">Слідкуйте за оновленнями сервера</div>
        </div>
      )}

      {/* Content */}
      {!loading && news.length > 0 && (
        <div className="flex flex-col gap-8">
          {/* Featured (page 1 only) */}
          {page === 1 && featured && (
            <NewsCardFeatured n={featured} />
          )}

          {/* Grid */}
          {(page === 1 ? rest : news).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(page === 1 ? rest : news).map(n => (
                <NewsCard key={n.id} n={n} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-1.5 mt-12">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="btn-ghost disabled:opacity-30 !px-4 !h-9"
          >← Назад</button>

          {pageNumbers().map((pg, i, arr) => (
            <Fragment key={pg}>
              {i > 0 && arr[i] - arr[i - 1] > 1 && (
                <span className="font-mono text-xs text-muted px-1">…</span>
              )}
              <button
                onClick={() => goToPage(pg)}
                className={`w-9 h-9 font-mono text-xs font-bold rounded-lg transition-all ${
                  pg === page
                    ? 'text-white shadow-[0_0_16px_rgba(247,37,133,0.4)]'
                    : 'border border-border text-muted hover:border-border2 hover:text-white bg-transparent'
                }`}
                style={pg === page ? { background: 'linear-gradient(135deg,#F72585,#7B2FBE)' } : {}}
              >{pg}</button>
            </Fragment>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="btn-ghost disabled:opacity-30 !px-4 !h-9"
          >Далі →</button>
        </div>
      )}
    </div>
  )
}
