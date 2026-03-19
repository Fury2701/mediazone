import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { statsApi, forumApi } from '../api/client'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'

function Counter({ target }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let v = 0
    const step = target / 60
    const t = setInterval(() => {
      v = Math.min(v + step, target)
      setVal(Math.floor(v))
      if (v >= target) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  }, [target])
  return <>{val.toLocaleString('uk')}</>
}

export default function Home() {
  const [stats, setStats] = useState(null)
  const [posts, setPosts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    statsApi.public().then(r => setStats(r.data)).catch(() => {})
    forumApi.posts({ limit: 4 }).then(r => setPosts(r.data)).catch(() => {})
  }, [])

  const features = [
    { n: '01', tag: 'ECONOMY',   title: 'Жива Економіка',        desc: 'Реалістична фінансова система, бізнес, нерухомість та інвестиції.' },
    { n: '02', tag: 'FACTIONS',  title: 'Фракції та організації', desc: 'LSPD, LSFD, мафія, байкери і десятки організацій з унікальними квестами.' },
    { n: '03', tag: 'VEHICLES',  title: 'Авторинок',              desc: 'Понад 500 кастомних автомобілів, тюнінг, страхування та система угнання.' },
    { n: '04', tag: 'PROPERTY',  title: 'Нерухомість',            desc: 'Купуй, продавай та орендуй нерухомість — від квартир до вілл у Vinewood.' },
    { n: '05', tag: 'JUSTICE',   title: 'Судова Система',         desc: 'Повноцінна система суддів, адвокатів та присяжних.' },
    { n: '06', tag: 'PHONE',     title: 'Кастомний телефон',      desc: 'Власний телефон, банківський додаток, соціальні мережі та GPS.' },
  ]

  return (
    <div>
      {/* HERO */}
      <div className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 md:w-[500px] md:h-[500px] rounded-full blur-[140px]"
            style={{ background: 'rgba(247,37,133,0.08)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 md:w-[400px] md:h-[400px] rounded-full blur-[120px]"
            style={{ background: 'rgba(123,47,190,0.10)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-6 w-full py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-cyan flex-shrink-0" />
                <span className="font-mono text-xs font-bold tracking-widest text-cyan uppercase">FiveM Roleplay Server</span>
              </div>
              <h1 className="font-display leading-none tracking-wide mb-6" style={{ fontSize: 'clamp(4rem,12vw,8rem)' }}>
                <span className="block text-white">MEDIA</span>
                <span className="block grad-text">ZONE</span>
                <span className="block font-condensed font-bold text-muted tracking-widest mt-2" style={{ fontSize: 'clamp(1rem,3vw,1.5rem)' }}>GTA 5 ROLEPLAY</span>
              </h1>
              <p className="font-body text-muted text-sm md:text-base leading-relaxed max-w-md mb-8">
                Найкращий Roleplay сервер в Україні. Жива економіка, реалістичний світ, унікальні механіки. Твоє нове життя в Los Santos.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="btn-cyan !h-12 !px-8 !text-base" onClick={() => navigate('/forum')}>Приєднатись</button>
                <button className="btn-ghost !h-12 !px-8 !text-sm" onClick={() => navigate('/rules')}>Правила</button>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-bg2 border border-border rounded-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                <span className="font-mono text-xs font-bold tracking-widest text-muted uppercase">Live статистика</span>
              </div>
              {[
                { label: 'Зареєстровано',  val: stats?.total_players ?? 0, color: 'text-white', sub: 'гравців всього' },
                { label: 'Зараз в мережі', val: stats?.online_now    ?? 0, color: 'text-green', sub: 'активних гравців' },
                { label: 'Годин зіграно',  val: stats?.total_hours   ?? 0, color: 'text-cyan',  sub: 'спільного геймплею' },
              ].map((s, i) => (
                <div key={i} className="px-5 py-4 border-b border-border last:border-none">
                  <div className="font-mono text-[10px] font-bold tracking-widest text-muted uppercase mb-1">{s.label}</div>
                  <div className={`font-display text-5xl leading-none ${s.color}`}>
                    {stats ? <Counter target={s.val} /> : '—'}
                  </div>
                  <div className="font-mono text-xs text-muted2 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #08060F)' }} />
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-2">Можливості</div>
            <h2 className="font-display text-5xl md:text-6xl uppercase">Що тебе чекає</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {features.map(f => (
            <div key={f.n} className="bg-bg p-6 group hover:bg-bg3 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-0.5 h-0 group-hover:h-full transition-all duration-300"
                style={{ background: 'linear-gradient(to bottom, #F72585, #7B2FBE)' }} />
              <div className="font-mono text-[10px] font-bold tracking-widest text-muted2 mb-3">{f.n} / {f.tag}</div>
              <div className="font-condensed font-black text-lg uppercase tracking-wide text-white mb-2">{f.title}</div>
              <div className="font-body text-sm text-muted leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NEWS */}
      {posts.length > 0 && (
        <div className="border-t border-b border-border bg-bg2">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
            <div className="flex items-center justify-between mb-5">
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase">Останні новини</div>
              <button className="font-mono text-xs text-cyan hover:text-white transition-colors" onClick={() => navigate('/forum')}>
                Всі новини →
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {posts.map(p => (
                <div key={p.id} className="bg-bg border border-border hover:border-border2 transition-colors cursor-pointer"
                  onClick={() => navigate(`/forum/${p.id}`)}>
                  {p.video_url && (
                    <div className="border-b border-border">
                      <video
                        src={p.video_url}
                        className="w-full max-h-64 object-cover"
                        controls
                        muted
                        playsInline
                        preload="metadata"
                      />
                    </div>
                  )}
                  <div className="px-4 md:px-5 py-4 flex items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-condensed font-bold text-base tracking-wide mb-1 truncate">{p.title}</div>
                      <div className="font-mono text-xs text-muted">
                        {p.author.username.toUpperCase()} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: uk })}
                        <span className="ml-2 text-muted2">💬 {p.reply_count} · 👁 {p.views}</span>
                      </div>
                    </div>
                    <span className="tag bg-cyan/10 text-cyan border border-cyan/25 flex-shrink-0">NEW</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-4">Готовий?</div>
        <h2 className="font-display mb-6" style={{ fontSize: 'clamp(3rem,10vw,5rem)' }}>ПОЧНИ ГРУ ЗАРАЗ</h2>
        <p className="font-body text-muted text-base max-w-md mx-auto mb-8">
          Зареєструйся на сайті, заходь на сервер FiveM і створи свого першого персонажа прямо в грі.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="btn-cyan !h-12 !px-10 !text-base" onClick={() => navigate('/forum')}>
            Зареєструватись
          </button>
          <button className="btn-ghost !h-12 !px-8 !text-sm" onClick={() => navigate('/rules')}>
            Читати правила
          </button>
        </div>
      </div>
    </div>
  )
}
