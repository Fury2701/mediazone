import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { statsApi, forumApi } from '../api/client'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'

function Counter({ target, suffix = '' }) {
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
  return <>{val.toLocaleString('uk')}{suffix}</>
}

export default function Home() {
  const [stats, setStats]   = useState(null)
  const [posts, setPosts]   = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    statsApi.public().then(r => setStats(r.data)).catch(() => {})
    forumApi.posts({ limit: 3 }).then(r => setPosts(r.data)).catch(() => {})
  }, [])

  const features = [
    { n: '01', tag: 'ECONOMY',   title: 'Жива Економіка',         desc: 'Реалістична фінансова система, бізнес, нерухомість та інвестиції.' },
    { n: '02', tag: 'FACTIONS',  title: 'Фракції та організації',  desc: 'LSPD, LSFD, мафія, байкери і десятки організацій з унікальними квестами.' },
    { n: '03', tag: 'VEHICLES',  title: 'Авторинок',               desc: 'Понад 500 кастомних автомобілів, тюнінг, страхування та система угнання.' },
    { n: '04', tag: 'PROPERTY',  title: 'Нерухомість',             desc: 'Купуй, продавай та орендуй нерухомість — від квартир до вілл у Vinewood.' },
    { n: '05', tag: 'JUSTICE',   title: 'Судова Система',          desc: 'Повноцінна система суддів, адвокатів та присяжних.' },
    { n: '06', tag: 'INTERFACE', title: 'Кастомний UI',            desc: 'Власний телефон, банківський додаток та соціальні мережі.' },
  ]

  return (
    <div>
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(#1E2D3D 1px,transparent 1px),linear-gradient(90deg,#1E2D3D 1px,transparent 1px)', backgroundSize: '80px 80px', opacity: 0.3 }} />
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(0,229,255,0.06),transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-[1fr_380px] gap-0 min-h-[calc(100vh-88px)]">
          {/* Left */}
          <div className="flex flex-col justify-center py-16 pr-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-cyan" />
              <span className="font-mono text-xs font-bold tracking-widest text-cyan uppercase">FiveM Roleplay Server</span>
            </div>
            <h1 className="font-condensed font-black leading-none tracking-tight mb-4" style={{ fontSize: '6rem' }}>
              <span className="block text-white">MEDIA</span>
              <span className="block text-cyan" style={{ textShadow: '0 0 60px rgba(0,229,255,0.3)' }}>ZONE</span>
              <span className="block text-muted text-2xl tracking-widest mt-1">GTA 5 RP</span>
            </h1>
            <p className="font-body text-muted text-base leading-relaxed max-w-md mb-8">
              Найкращий Roleplay сервер в Україні. Жива економіка, реалістичний світ, унікальні механіки. Твоє життя в Los Santos починається тут.
            </p>
            <div className="flex gap-3">
              <button className="btn-cyan !h-12 !px-8 !text-base" onClick={() => navigate('/forum')}>
                Приєднатись
              </button>
              <button className="btn-ghost !h-12 !px-8 !text-sm" onClick={() => navigate('/about')}>
                Про проект
              </button>
            </div>
          </div>

          {/* Right — Live stats */}
          <div className="flex flex-col justify-center border-l border-border pl-8 py-8">
            <div className="absolute top-8 right-6 font-mono text-xs font-black text-orange tracking-widest" style={{ writingMode: 'vertical-rl' }}>LIVE</div>
            {[
              { label: 'Зареєстровано', val: stats?.total_players ?? 0, color: 'text-white', sub: 'гравців всього' },
              { label: 'Зараз в мережі', val: stats?.online_now ?? 0, color: 'text-green', sub: 'активних гравців' },
              { label: 'Годин зіграно', val: stats?.total_hours ?? 0, color: 'text-cyan', sub: 'спільного геймплею' },
            ].map((s, i) => (
              <div key={i} className="py-5 border-b border-border last:border-none">
                <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-1">{s.label}</div>
                <div className={`font-condensed font-black leading-none tracking-tight ${s.color}`} style={{ fontSize: '3rem' }}>
                  {stats ? <Counter target={s.val} /> : '—'}
                </div>
                <div className="font-mono text-xs text-muted mt-1">{s.sub}</div>
              </div>
            ))}
            <div className="py-5">
              <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-1">Інфраструктура</div>
              <div className="font-condensed font-black text-xl text-white font-mono">K3S / ARGO</div>
              <div className="font-mono text-xs text-muted mt-1">kubernetes + gitops</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-2">Можливості</div>
            <h2 className="font-condensed font-black text-5xl uppercase tracking-tight">Що тебе чекає</h2>
          </div>
          <div className="font-condensed font-black text-8xl text-border2 font-mono leading-none">01</div>
        </div>
        <div className="grid grid-cols-3 gap-px bg-border">
          {features.map(f => (
            <div key={f.n} className="bg-bg p-7 group hover:bg-bg3 transition-colors relative overflow-hidden cursor-default">
              <div className="absolute top-0 left-0 w-0.5 h-0 bg-cyan group-hover:h-full transition-all duration-300" />
              <div className="font-mono text-xs font-bold tracking-widest text-muted2 mb-3">{f.n} / {f.tag}</div>
              <div className="font-condensed font-black text-lg uppercase tracking-wide text-white mb-2">{f.title}</div>
              <div className="font-body text-sm text-muted leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT POSTS */}
      {posts.length > 0 && (
        <div className="border-t border-b border-border bg-bg2">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-5">Останні новини</div>
            <div className="flex flex-col gap-px bg-border">
              {posts.map(p => (
                <div key={p.id}
                  onClick={() => navigate(`/forum/${p.id}`)}
                  className="bg-bg2 hover:bg-bg3 px-5 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-condensed font-bold text-base tracking-wide mb-1">{p.title}</div>
                    <div className="font-mono text-xs text-muted">
                      {p.author.username.toUpperCase()} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: uk })} · {p.views} переглядів
                    </div>
                  </div>
                  <span className="tag bg-red/15 text-red border border-red/30 flex-shrink-0">NEW</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
