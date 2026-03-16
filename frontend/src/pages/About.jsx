// About.jsx
export function About() {
  const tech = [
    { tag: '☸ KUBERNETES', title: 'K3S Кластер', text: 'Легковісний Kubernetes для production. Автомасштабування та health checks гарантують стабільну роботу навіть під піковим навантаженням.' },
    { tag: '→ GITOPS',     title: 'ArgoCD Deploy', text: 'GitOps: стан кластера завжди синхронізований з GitHub. Кожна зміна в main — автоматично на production без ручного втручання.' },
    { tag: '⚡ CI/CD',      title: 'GitHub Actions', text: 'Повний pipeline: lint → тести → Docker build → push до GHCR → trigger ArgoCD sync. Від git push до живого сервера — менше 3 хвилин.' },
    { tag: '◉ METRICS',    title: 'Grafana + Prometheus', text: 'Realtime метрики: онлайн гравці, CPU/RAM pods, latency, error rate. Alertmanager сповіщає команду при аномаліях.' },
  ]
  const pipeline = ['Git Push','Actions','GHCR','ArgoCD','K3S']
  const roadmap = [
    { done: true,  title: 'Запуск сервера v1.0',        desc: 'Базові механіки RP, фракції, економіка.' },
    { done: true,  title: 'Міграція на K3S + ArgoCD',   desc: 'Повна контейнеризація та GitOps pipeline.' },
    { active: true, title: 'Оновлення 2.5 — Нові механіки', desc: 'Нові фракції, система мисливства, оновлений UI. В розробці.' },
    { done: false, title: 'React фронтенд',              desc: 'Повноцінний SPA підключений до FastAPI.' },
    { done: false, title: 'Multi-region кластер',        desc: 'Розширення інфраструктури для зменшення пінгу.' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-bg2 border border-border p-10 mb-6 grid grid-cols-[1fr_auto] gap-8 items-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center,rgba(0,229,255,0.04),transparent 70%)' }} />
        <div className="relative">
          <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-3">Media Zone RP — Про проект</div>
          <h1 className="font-condensed font-black text-6xl uppercase leading-none tracking-tight mb-4">Технології<br/>та Команда</h1>
          <p className="font-body text-muted text-sm leading-relaxed max-w-lg">Ми будуємо не просто ігровий сервер — це повноцінна хмарна платформа з автоматизованим деплоєм, моніторингом та масштабуванням на базі Kubernetes.</p>
        </div>
        <div className="relative text-right flex-shrink-0">
          <div className="font-condensed font-black text-7xl text-green leading-none font-mono">99.9%</div>
          <div className="font-mono text-xs text-muted uppercase tracking-widest mt-1">Uptime SLA</div>
          <div className="font-mono text-xs text-muted mt-1">k3s cluster / argocd</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border mb-6">
        {tech.map(t => (
          <div key={t.tag} className="bg-bg2 p-6 border-t-4 border-transparent hover:border-cyan transition-colors">
            <div className="inline-flex items-center h-5 px-2.5 border border-border2 font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">{t.tag}</div>
            <div className="font-condensed font-black text-lg uppercase tracking-wide mb-2">{t.title}</div>
            <div className="font-body text-sm text-muted leading-relaxed">{t.text}</div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="bg-bg2 border border-border p-6 mb-6">
        <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-5">CI/CD Pipeline</div>
        <div className="flex items-center">
          {pipeline.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex-1 text-center">
                <div className="w-11 h-11 bg-bg3 border border-border2 flex items-center justify-center font-mono text-lg mx-auto mb-2">
                  {['📝','⚡','🐳','🚀','☸'][i]}
                </div>
                <div className="font-condensed font-black text-xs uppercase tracking-wide">{s}</div>
              </div>
              {i < pipeline.length - 1 && (
                <div className="w-8 h-px bg-border2 flex-shrink-0 relative">
                  <div className="absolute right-0 top-[-3px] border-4 border-transparent border-l-4 border-l-border2" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-4">Дорожня карта</div>
      <div className="flex flex-col">
        {roadmap.map((r, i) => (
          <div key={i} className="flex gap-4 py-5 border-b border-border last:border-none">
            <div className={`w-9 h-9 flex-shrink-0 flex items-center justify-center font-mono text-sm font-black border
              ${r.done ? 'bg-cyan text-bg border-cyan' : r.active ? 'border-orange text-orange' : 'border-border2 text-muted2'}`}>
              {r.done ? '✓' : r.active ? '→' : '○'}
            </div>
            <div className={r.done || r.active ? '' : 'opacity-50'}>
              <div className="font-condensed font-black text-base uppercase tracking-wide mb-1">{r.title}</div>
              <div className="font-body text-sm text-muted">{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default About
