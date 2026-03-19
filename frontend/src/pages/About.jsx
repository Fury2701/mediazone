export default function About() {
  const values = [
    {
      icon: '🎭',
      title: 'Глибокий Roleplay',
      text: 'Ми ставимо відіграш на перше місце. Кожна дія має наслідки, кожен персонаж — свою історію. Ніяких "я в меті" — тільки живий світ.',
    },
    {
      icon: '⚖️',
      title: 'Чесна гра',
      text: 'Нульова толерантність до читерства та токсичності. Суворі але справедливі правила, незалежна адміністрація, прозорі рішення.',
    },
    {
      icon: '🏗️',
      title: 'Активний розвиток',
      text: 'Команда розробників щотижня додає новий контент. Ми слухаємо спільноту і впроваджуємо найкращі ідеї гравців.',
    },
    {
      icon: '🤝',
      title: 'Жива спільнота',
      text: 'Більше ніж сервер — це спільнота однодумців. Discord, форум, івенти, турніри та реальні зв\'язки між гравцями.',
    },
  ]

  const roadmap = [
    {
      version: 'v1.0', status: 'done', label: 'LAUNCHED', date: 'Q1 2025',
      title: 'Запуск сервера',
      items: ['Запуск на FiveM платформі', 'Система персонажів — формат Name_Surname', 'Базові роботи: таксист, механік, сміттяр', 'Банківська система — готівка, банк, перекази', 'Базовий крим: пограбування магазинів'],
    },
    {
      version: 'v1.5', status: 'done', label: 'LAUNCHED', date: 'Q2 2025',
      title: 'Сайт та кабінет',
      items: ['Офіційний сайт та форум спільноти', 'Особистий кабінет гравця', 'Статистика сервера в реальному часі', 'Реєстрація персонажів через гру'],
    },
    {
      version: 'v2.0', status: 'active', label: 'IN PROGRESS', date: 'Q3 2025',
      title: 'Фракції та бізнес',
      items: ['Фракції: LSPD, LSFD, Уряд, Мафія, Grove Street', 'Система бізнесів: магазини, гаражі, ресторани', 'Нерухомість: квартири, будинки, вілли Vinewood', 'Розширена система злочинності'],
    },
    {
      version: 'v2.5', status: 'planned', label: 'PLANNED', date: 'Q4 2025',
      title: 'Транспорт та наркотики',
      items: ['Авторинок 2.0 — понад 500 авто з тюнінгом', 'Страхування та система угнання авто', 'Наркосистема: вирощування, виробництво, продаж', 'Судова система: судді, адвокати, в\'язниця'],
    },
    {
      version: 'v3.0', status: 'planned', label: 'PLANNED', date: 'Q1 2026',
      title: 'Телефон та політика',
      items: ['Кастомний телефон: соцмережі, банківський додаток, GPS', 'Політична система: вибори, мер, губернатор штату', 'Система пограбувань: банки, інкасатори', 'Розширена медична система (LSFD 2.0)'],
    },
    {
      version: 'S2', status: 'planned', label: 'FUTURE', date: '2026',
      title: 'Season 2 — Новий контент',
      items: ['Нові зони: розвиток Paleto Bay та Cayo Perico', 'Нові фракції: ФБР, ДЕА, байкерські клуби', 'Система івентів: турніри, сезонні події', 'Власний лаунчер та античіт система'],
    },
  ]

  const statusStyle = {
    done:    { dot: 'bg-cyan',    badge: 'text-cyan border-cyan/40 bg-cyan/10',        icon: '✓' },
    active:  { dot: 'bg-orange',  badge: 'text-orange border-orange/40 bg-orange/10',  icon: '→' },
    planned: { dot: 'bg-border2', badge: 'text-muted2 border-border2 bg-bg3',          icon: '○' },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">

      {/* Hero */}
      <div className="relative bg-bg2 border border-border p-8 md:p-12 mb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(247,37,133,0.06), transparent 60%)' }} />
        <div className="relative max-w-2xl">
          <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-3">Media Zone RP — Про нас</div>
          <h1 className="font-display uppercase leading-none mb-5" style={{ fontSize: 'clamp(2.5rem,8vw,5rem)' }}>
            Ласкаво просимо<br />до Los Santos
          </h1>
          <p className="font-body text-muted text-base leading-relaxed mb-4">
            MediaZone RP — це україномовний FiveM сервер з акцентом на якісний roleplay та живу економіку. Ми запустились у 2025 році з метою створити місце, де кожен гравець може прожити справжнє паралельне життя в Los Santos.
          </p>
          <p className="font-body text-muted text-base leading-relaxed">
            Від вуличного торговця до мера міста — кожна роль важлива. Від простого механіка до керівника поліції — кожна кар'єра реальна. Твоя історія починається тут.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-10">
        <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-2">Наші принципи</div>
        <h2 className="font-display text-4xl md:text-5xl uppercase mb-8">Чим ми живемо</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          {values.map(v => (
            <div key={v.title} className="bg-bg2 p-6 md:p-7 hover:bg-bg3 transition-colors group">
              <div className="text-3xl mb-4">{v.icon}</div>
              <div className="font-condensed font-black text-xl uppercase tracking-wide mb-2 group-hover:text-cyan transition-colors">{v.title}</div>
              <div className="font-body text-sm text-muted leading-relaxed">{v.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Join CTA */}
      <div className="bg-bg2 border border-border p-8 mb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(247,37,133,0.05), transparent 70%)' }} />
        <div className="relative">
          <div className="font-display text-5xl md:text-6xl mb-4 grad-text">ПРИЄДНУЙСЯ</div>
          <p className="font-body text-muted text-base max-w-md mx-auto mb-6">
            Встанови FiveM, підключись до сервера MediaZone і почни свою нову RP-кар'єру вже сьогодні.
          </p>
          <div className="font-mono text-sm text-white/60 bg-bg3 border border-border inline-block px-4 py-2 rounded-sm tracking-widest">
            connect mediazone.gg
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="mb-3">
        <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-1">Дорожня карта</div>
        <h2 className="font-display text-4xl md:text-5xl uppercase mb-2">Що вже є і що буде</h2>
      </div>

      <div className="flex items-center gap-5 mb-8 flex-wrap">
        {[['done','ВИКОНАНО'],['active','В РОЗРОБЦІ'],['planned','ЗАПЛАНОВАНО']].map(([s, l]) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusStyle[s].dot}`} />
            <span className="font-mono text-xs text-muted">{l}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-[72px] md:left-[88px] top-0 bottom-0 w-px bg-border" />
        <div className="flex flex-col gap-0">
          {roadmap.map((r, i) => {
            const st = statusStyle[r.status]
            return (
              <div key={i} className={`flex gap-0 ${r.status === 'planned' ? 'opacity-60' : ''}`}>
                <div className="w-[72px] md:w-[88px] flex-shrink-0 pt-5 pr-4 text-right">
                  <div className="font-condensed font-black text-sm md:text-base text-white">{r.version}</div>
                  <div className="font-mono text-[10px] text-muted2">{r.date}</div>
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 z-10 flex-shrink-0
                    ${r.status === 'done' ? 'bg-cyan border-cyan' : r.status === 'active' ? 'bg-orange border-orange' : 'bg-bg border-border2'}`}
                    style={{ marginTop: '22px' }}
                  />
                </div>
                <div className={`flex-1 ml-4 md:ml-6 pb-8 pt-4 border-b border-border last:border-none min-w-0
                  ${r.status === 'active' ? 'border-l-2 border-l-orange pl-4' : ''}`}>
                  <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                    <h3 className="font-condensed font-black text-lg md:text-xl uppercase tracking-wide">{r.title}</h3>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border tracking-widest ${st.badge}`}>{r.label}</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {r.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className={`font-mono text-xs mt-0.5 flex-shrink-0 ${r.status === 'done' ? 'text-cyan' : r.status === 'active' ? 'text-orange' : 'text-muted2'}`}>
                          {st.icon}
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
