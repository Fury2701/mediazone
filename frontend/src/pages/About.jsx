export default function About() {
  const tech = [
    { tag: '☸ KUBERNETES', title: 'K3S Кластер', text: 'Легковісний Kubernetes для production. Автомасштабування та health checks гарантують стабільну роботу навіть під піковим навантаженням.' },
    { tag: '→ GITOPS',     title: 'ArgoCD Deploy', text: 'GitOps: стан кластера завжди синхронізований з GitHub. Кожна зміна в main — автоматично на production без ручного втручання.' },
    { tag: '⚡ CI/CD',      title: 'GitHub Actions', text: 'Повний pipeline: тести → Docker build → push до GHCR → ArgoCD sync. Від git push до живого сервера — менше 3 хвилин.' },
    { tag: '◉ METRICS',    title: 'Grafana + Prometheus', text: 'Realtime метрики: онлайн гравці, CPU/RAM pods, latency, error rate. Alertmanager сповіщає команду при аномаліях.' },
  ]

  const pipeline = ['Git Push', 'Actions', 'GHCR', 'ArgoCD', 'K3S']

  const roadmap = [
    {
      version: 'v1.0',
      status: 'done',
      label: 'LAUNCHED',
      date: 'Q1 2025',
      title: 'Запуск сервера',
      items: [
        'Запуск на FiveM платформі',
        'Система персонажів — формат Name_Surname',
        'Базові роботи: таксист, механік, сміттяр, далекобійник',
        'Банківська система — готівка, банк, перекази',
        'Базовий крим: пограбування магазинів',
      ],
    },
    {
      version: 'v1.5',
      status: 'done',
      label: 'LAUNCHED',
      date: 'Q2 2025',
      title: 'Сайт та кабінет',
      items: [
        'Офіційний сайт та форум спільноти',
        'Особистий кабінет гравця',
        'Статистика сервера в реальному часі',
        'Реєстрація та авторизація персонажів',
      ],
    },
    {
      version: 'v2.0',
      status: 'active',
      label: 'IN PROGRESS',
      date: 'Q3 2025',
      title: 'Фракції та бізнес',
      items: [
        'Фракції: LSPD, LSFD, Уряд, Мафія, Grove Street',
        'Система бізнесів: магазини, гаражі, ресторани',
        'Нерухомість: квартири, будинки, вілли Vinewood',
        'Розширена система злочинності',
      ],
    },
    {
      version: 'v2.5',
      status: 'planned',
      label: 'PLANNED',
      date: 'Q4 2025',
      title: 'Транспорт та наркотики',
      items: [
        'Авторинок 2.0 — понад 500 авто з тюнінгом',
        'Страхування та система угнання авто',
        'Наркосистема: вирощування, виробництво, продаж',
        'Судова система: судді, адвокати, в\'язниця',
      ],
    },
    {
      version: 'v3.0',
      status: 'planned',
      label: 'PLANNED',
      date: 'Q1 2026',
      title: 'Телефон та політика',
      items: [
        'Кастомний телефон: соцмережі, банківський додаток, GPS',
        'Політична система: вибори, мер, губернатор штату',
        'Система пограбувань: банки, інкасатори',
        'Розширена медична система (LSFD 2.0)',
      ],
    },
    {
      version: 'S2',
      status: 'planned',
      label: 'FUTURE',
      date: '2026',
      title: 'Season 2 — Новий контент',
      items: [
        'Нові зони: розвиток Paleto Bay та Cayo Perico',
        'Нові фракції: ФБР, ДЕА, байкерські клуби',
        'Система івентів: турніри, сезонні події',
        'Власний лаунчер та античіт система',
      ],
    },
  ]

  const statusStyle = {
    done:    { dot: 'bg-cyan',   badge: 'text-cyan border-cyan/40 bg-cyan/10',    icon: '✓' },
    active:  { dot: 'bg-orange', badge: 'text-orange border-orange/40 bg-orange/10', icon: '→' },
    planned: { dot: 'bg-border2',badge: 'text-muted2 border-border2 bg-bg3',       icon: '○' },
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
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

      {/* Tech */}
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
      <div className="bg-bg2 border border-border p-6 mb-10">
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
      <div className="mb-3">
        <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-1">Дорожня карта розвитку</div>
        <h2 className="font-condensed font-black text-4xl uppercase tracking-tight">Що вже є і що буде</h2>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-8">
        {[['done','ВИКОНАНО'],['active','В РОЗРОБЦІ'],['planned','ЗАПЛАНОВАНО']].map(([s, l]) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusStyle[s].dot}`} />
            <span className="font-mono text-xs text-muted">{l}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[88px] top-0 bottom-0 w-px bg-border" />

        <div className="flex flex-col gap-0">
          {roadmap.map((r, i) => {
            const st = statusStyle[r.status]
            return (
              <div key={i} className={`flex gap-0 ${r.status === 'planned' ? 'opacity-60' : ''}`}>
                {/* Version + date */}
                <div className="w-[88px] flex-shrink-0 pt-5 pr-5 text-right">
                  <div className="font-condensed font-black text-base text-white">{r.version}</div>
                  <div className="font-mono text-[10px] text-muted2">{r.date}</div>
                </div>

                {/* Dot */}
                <div className="flex flex-col items-center flex-shrink-0 relative">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-5.5 z-10 flex-shrink-0
                    ${r.status === 'done' ? 'bg-cyan border-cyan' : r.status === 'active' ? 'bg-orange border-orange' : 'bg-bg border-border2'}`}
                    style={{ marginTop: '22px' }}
                  />
                </div>

                {/* Content */}
                <div className={`flex-1 ml-6 pb-8 pt-4 border-b border-border last:border-none
                  ${r.status === 'active' ? 'border-l-2 border-l-orange pl-4 ml-4 -ml-0' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-condensed font-black text-xl uppercase tracking-wide">{r.title}</h3>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border tracking-widest ${st.badge}`}>
                      {r.label}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {r.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className={`font-mono text-xs mt-0.5 flex-shrink-0 ${r.status === 'done' ? 'text-cyan' : r.status === 'active' ? 'text-orange' : 'text-muted2'}`}>
                          {r.status === 'done' ? '✓' : r.status === 'active' ? '→' : '·'}
                        </span>
                        <span className="font-body text-sm text-muted leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
