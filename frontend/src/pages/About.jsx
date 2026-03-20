import { useState } from 'react'

const GOV_STRUCTURES = [
  {
    id: 'lspd',
    icon: '👮',
    tag: 'LSPD',
    name: 'Los Santos Police Department',
    color: 'blue',
    colorClass: 'text-blue-400 border-blue-400/40 bg-blue-400/10',
    glowStyle: { background: 'radial-gradient(ellipse at 0% 50%, rgba(59,130,246,0.08), transparent 60%)' },
    borderActive: 'border-l-blue-400',
    desc: 'Поліцейський департамент міста Los Santos — головна правоохоронна структура сервера. LSPD підтримує правопорядок, розслідує злочини, патрулює вулиці та затримує порушників закону.',
    mission: 'Захист та служіння громаді Los Santos.',
    ranks: [
      { n: '01', name: 'Recruit', desc: 'Новий офіцер на випробувальному терміні' },
      { n: '02', name: 'Officer', desc: 'Патрульний офіцер — базовий склад LSPD' },
      { n: '03', name: 'Senior Officer', desc: 'Досвідчений офіцер, наставник рекрутів' },
      { n: '04', name: 'Corporal', desc: 'Молодший командний склад' },
      { n: '05', name: 'Sergeant', desc: 'Командир патрульної групи' },
      { n: '06', name: 'Lieutenant', desc: 'Офіцер управлінської ланки' },
      { n: '07', name: 'Captain', desc: 'Командир відділу або підрозділу' },
      { n: '08', name: 'Chief of Police', desc: 'Начальник поліції Los Santos' },
    ],
    requirements: [
      'Мінімум 15 годин на сервері',
      'Чистий персонаж — без кримінальних правопорушень',
      'Знання правил та кримінального кодексу',
      'РП-нік у форматі Name_Surname',
      'Пройти співбесіду в Discord',
    ],
    divisions: ['Patrol Division', 'Criminal Investigations (CID)', 'SWAT / SEB', 'Internal Affairs', 'Traffic Enforcement'],
  },
  {
    id: 'lsfd',
    icon: '🚒',
    tag: 'LSFD',
    name: 'Los Santos Fire Department',
    color: 'red',
    colorClass: 'text-red-400 border-red-400/40 bg-red-400/10',
    glowStyle: { background: 'radial-gradient(ellipse at 0% 50%, rgba(239,68,68,0.08), transparent 60%)' },
    borderActive: 'border-l-red-400',
    desc: 'Пожежна та медична служба Los Santos. LSFD рятує життя — ліквідує пожежі, надає медичну допомогу пораненим та загиблим, реагує на надзвичайні ситуації по всьому місту.',
    mission: 'Рятувати кожне життя. Будь-де. Будь-коли.',
    ranks: [
      { n: '01', name: 'Probationary FF/EMT', desc: 'Стажер пожежно-медичної служби' },
      { n: '02', name: 'Firefighter/EMT', desc: 'Пожежний та фельдшер базового рівня' },
      { n: '03', name: 'Senior FF/Paramedic', desc: 'Старший пожежний / Парамедик' },
      { n: '04', name: 'Engineer', desc: 'Технічний спеціаліст, оператор техніки' },
      { n: '05', name: 'Lieutenant', desc: 'Командир бригади реагування' },
      { n: '06', name: 'Captain', desc: 'Командир пожежної станції' },
      { n: '07', name: 'Battalion Chief', desc: 'Командир батальйону' },
      { n: '08', name: 'Fire Chief', desc: 'Начальник пожежно-рятувальної служби' },
    ],
    requirements: [
      'Мінімум 10 годин на сервері',
      'Бажання допомагати іншим гравцям',
      'Базові знання медичного та пожежного RP',
      'РП-нік у форматі Name_Surname',
      'Пройти навчальний курс LSFD',
    ],
    divisions: ['Fire Suppression', 'Emergency Medical Services (EMS)', 'Technical Rescue', 'Hazmat Unit', 'Air Operations'],
  },
  {
    id: 'gov',
    icon: '🏛️',
    tag: 'GOV',
    name: 'Уряд міста / City Hall',
    color: 'yellow',
    colorClass: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
    glowStyle: { background: 'radial-gradient(ellipse at 0% 50%, rgba(234,179,8,0.08), transparent 60%)' },
    borderActive: 'border-l-yellow-400',
    desc: 'Міська адміністрація Los Santos відповідає за управління містом, прийняття законів, видачу ліцензій та контроль бізнесу. Уряд формує правову базу для всього RP на сервері.',
    mission: 'Справедливе управління містом в інтересах усіх громадян.',
    ranks: [
      { n: '01', name: 'City Clerk', desc: 'Муніципальний службовець' },
      { n: '02', name: 'Inspector', desc: 'Інспектор ліцензій та перевірок' },
      { n: '03', name: 'Advisor', desc: 'Радник міської ради' },
      { n: '04', name: 'Council Member', desc: 'Член міської ради' },
      { n: '05', name: 'Deputy Mayor', desc: 'Заступник мера' },
      { n: '06', name: 'Mayor', desc: 'Мер міста Los Santos' },
    ],
    requirements: [
      'Мінімум 20 годин на сервері',
      'Бездоганна репутація та чиста біографія',
      'Знання законодавчої бази сервера',
      'Активність у форумі та спільноті',
      'Проходження відбіркового конкурсу',
    ],
    divisions: ['Mayor\'s Office', 'City Council', 'Department of Licensing', 'Department of Finance', 'Public Relations'],
  },
]

const CRIME_STRUCTURES = [
  {
    id: 'mafia',
    icon: '🤵',
    tag: 'MAFIA',
    name: 'Мафія Los Santos',
    color: 'purple',
    colorClass: 'text-purple-400 border-purple-400/40 bg-purple-400/10',
    glowStyle: { background: 'radial-gradient(ellipse at 0% 50%, rgba(168,85,247,0.08), transparent 60%)' },
    desc: 'Організована злочинна організація з чіткою ієрархією та власними законами. Мафія контролює тіньовий бізнес, рекет, відмивання грошей та розподіл кримінального впливу в місті.',
    style: 'Стриманий стиль, дорогі авто, легальне прикриття. Ніколи не афішують своє членство.',
    ranks: [
      { n: '01', name: 'Associate', desc: 'Людина, що виконує доручення' },
      { n: '02', name: 'Soldier', desc: 'Боєць — офіційний член сім\'ї' },
      { n: '03', name: 'Capo', desc: 'Капо — командує своєю бригадою' },
      { n: '04', name: 'Underboss', desc: 'Підбос — права рука дона' },
      { n: '05', name: 'Don', desc: 'Дон сім\'ї — найвищий авторитет' },
    ],
    activities: ['Рекет та "дах" для бізнесів', 'Контрабанда та відмивання', 'Нічний клуб та казино', 'Торгівля зброєю', 'Корупція держструктур'],
  },
  {
    id: 'grove',
    icon: '🌿',
    tag: 'GROVE',
    name: 'Grove Street Families',
    color: 'green',
    colorClass: 'text-green-400 border-green-400/40 bg-green-400/10',
    glowStyle: { background: 'radial-gradient(ellipse at 0% 50%, rgba(34,197,94,0.08), transparent 60%)' },
    desc: 'Вулична банда Гроув-стріт — одна з найстаріших банд Los Santos. Базується в районі Davis. Захищає свою територію та народ. Зелений — колір братства.',
    style: 'Вулична культура, командна робота, лояльність до своїх. Зелений дрес-код.',
    ranks: [
      { n: '01', name: 'Shorty', desc: 'Новачок на районі' },
      { n: '02', name: 'Homie', desc: 'Свій на вулиці' },
      { n: '03', name: 'OG', desc: 'Original Gangster — ветеран банди' },
      { n: '04', name: 'Shot Caller', desc: 'Відповідальний за операції' },
      { n: '05', name: 'OG Leader', desc: 'Лідер Grove Street' },
    ],
    activities: ['Захист території в Davis', 'Наркоторгівля на вулиці', 'Угон авто', 'Розбій та грабіж', 'Протистояння з ворожими бандами'],
  },
  {
    id: 'cartel',
    icon: '🌵',
    tag: 'CARTEL',
    name: 'Los Santos Cartel',
    color: 'orange',
    colorClass: 'text-orange border-orange/40 bg-orange/10',
    glowStyle: { background: 'radial-gradient(ellipse at 0% 50%, rgba(251,146,60,0.08), transparent 60%)' },
    desc: 'Латиноамериканський наркокартель, що контролює виробництво та дистрибуцію наркотиків. Картель оперує через мережу плантацій та лабораторій у передмісті та пустелі.',
    style: 'Пустеля, сільська місцевість, великі партії. Сила в єдності та конспірації.',
    ranks: [
      { n: '01', name: 'Soldado', desc: 'Рядовий боєць картелю' },
      { n: '02', name: 'Sicario', desc: 'Найманий виконавець' },
      { n: '03', name: 'Teniente', desc: 'Лейтенант — командир бригади' },
      { n: '04', name: 'Comandante', desc: 'Командир сектору' },
      { n: '05', name: 'El Jefe', desc: 'Голова картелю' },
    ],
    activities: ['Вирощування та виробництво наркотиків', 'Оптова дистрибуція', 'Контрабанда зброї', 'Викрадення та вимагання', 'Підкуп чиновників'],
  },
]

export default function About() {
  const [govTab, setGovTab] = useState('lspd')
  const [crimeTab, setCrimeTab] = useState('mafia')
  const [roadmapOpen, setRoadmapOpen] = useState(null)

  const activeGov = GOV_STRUCTURES.find(s => s.id === govTab)
  const activeCrime = CRIME_STRUCTURES.find(s => s.id === crimeTab)

  const roadmap = [
    {
      version: 'v1.0', status: 'done', date: 'Q1 2025',
      title: 'Запуск сервера',
      items: ['Запуск на FiveM платформі', 'Система персонажів Name_Surname', 'Базові роботи: таксист, механік, сміттяр', 'Банківська система', 'Базовий крим: крадіжки, пограбування магазинів'],
    },
    {
      version: 'v1.5', status: 'done', date: 'Q2 2025',
      title: 'Сайт та кабінет',
      items: ['Офіційний сайт та форум спільноти', 'Особистий кабінет гравця', 'Реєстрація персонажів через гру', 'Новинна стрічка та оголошення'],
    },
    {
      version: 'v2.0', status: 'active', date: 'Q3 2025',
      title: 'Фракції та бізнес',
      items: ['Держструктури: LSPD, LSFD, Уряд', 'Кримінальні організації: Мафія, Grove, Картель', 'Система бізнесів: магазини, гаражі, ресторани', 'Нерухомість: квартири, будинки'],
    },
    {
      version: 'v2.5', status: 'planned', date: 'Q4 2025',
      title: 'Транспорт та злочинність',
      items: ['Авторинок 2.0 — 500+ авто з тюнінгом', 'Страхування та угон авто', 'Наркосистема: плантації, лабораторії, торгівля', 'Судова система: судді, адвокати, в\'язниця'],
    },
    {
      version: 'v3.0', status: 'planned', date: 'Q1 2026',
      title: 'Телефон та політика',
      items: ['Кастомний телефон з соцмережами та GPS', 'Вибори мера та міської ради', 'Пограбування банків та інкасаторів', 'Медична система LSFD 2.0'],
    },
  ]

  const statusStyle = {
    done:    { dot: 'bg-cyan',    badge: 'text-cyan border-cyan/40 bg-cyan/10',       icon: '✓', label: 'ВИКОНАНО' },
    active:  { dot: 'bg-orange',  badge: 'text-orange border-orange/40 bg-orange/10', icon: '→', label: 'В РОЗРОБЦІ' },
    planned: { dot: 'bg-border2', badge: 'text-muted2 border-border2 bg-bg3',         icon: '○', label: 'ЗАПЛАНОВАНО' },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">

      {/* Hero */}
      <div className="relative bg-bg2 border border-border p-8 md:p-12 mb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(247,37,133,0.07), transparent 60%)' }} />
        <div className="relative max-w-2xl">
          <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-3">MediaZone RP — Про проект</div>
          <h1 className="font-display uppercase leading-none mb-5" style={{ fontSize: 'clamp(2.5rem,8vw,5rem)' }}>
            Живий світ<br />Los Santos
          </h1>
          <p className="font-body text-muted text-base leading-relaxed mb-4">
            MediaZone RP — україномовний FiveM сервер з акцентом на якісний roleplay, живу економіку та повноцінну фракційну систему. Ми запустились у 2025 році з метою створити місце, де кожен гравець проживає справжнє паралельне життя.
          </p>
          <p className="font-body text-muted text-base leading-relaxed">
            Вибери свій шлях: стань захисником закону в LSPD, рятівником у LSFD, керуй містом в уряді — або обери темну сторону і піднімись по кримінальній драбині. Твоя доля — у твоїх руках.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-1">Наші принципи</div>
        <h2 className="font-display text-4xl md:text-5xl uppercase mb-8">Чим ми живемо</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          {[
            { icon: '🎭', title: 'Глибокий Roleplay', text: 'Ми ставимо відіграш на перше місце. Кожна дія має наслідки, кожен персонаж — свою історію. Ніяких "я в меті" — тільки живий світ.' },
            { icon: '⚖️', title: 'Чесна гра', text: 'Нульова толерантність до читерства та токсичності. Суворі але справедливі правила, незалежна адміністрація, прозорі рішення.' },
            { icon: '🏗️', title: 'Активний розвиток', text: 'Команда розробників регулярно додає новий контент. Ми слухаємо спільноту і впроваджуємо найкращі ідеї гравців.' },
            { icon: '🤝', title: 'Жива спільнота', text: 'Більше ніж сервер — це спільнота однодумців. Discord, форум, івенти, турніри та реальні зв\'язки між гравцями.' },
          ].map(v => (
            <div key={v.title} className="bg-bg2 p-6 md:p-7 hover:bg-bg3 transition-colors group">
              <div className="text-3xl mb-4">{v.icon}</div>
              <div className="font-condensed font-black text-xl uppercase tracking-wide mb-2 group-hover:text-cyan transition-colors">{v.title}</div>
              <div className="font-body text-sm text-muted leading-relaxed">{v.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Government Structures */}
      <div className="mb-12">
        <div className="font-mono text-xs font-bold tracking-widest text-cyan uppercase mb-1">Структури</div>
        <h2 className="font-display text-4xl md:text-5xl uppercase mb-2">Держструктури</h2>
        <p className="font-body text-sm text-muted mb-6">Офіційні організації, що підтримують правопорядок, надають послуги та керують містом.</p>

        {/* Gov Tabs */}
        <div className="flex gap-px bg-border mb-px">
          {GOV_STRUCTURES.map(s => (
            <button
              key={s.id}
              onClick={() => setGovTab(s.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-colors
                ${govTab === s.id ? 'bg-bg3 text-white' : 'bg-bg2 text-muted hover:bg-bg3 hover:text-white'}`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.tag}</span>
            </button>
          ))}
        </div>

        {activeGov && (
          <div className="bg-bg2 border border-border overflow-hidden">
            <div className="relative p-6 md:p-8 border-b border-border">
              <div className="absolute inset-0 pointer-events-none" style={activeGov.glowStyle} />
              <div className="relative flex flex-col md:flex-row md:items-start gap-4">
                <div className="text-5xl">{activeGov.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border tracking-widest ${activeGov.colorClass}`}>{activeGov.tag}</span>
                    <h3 className="font-condensed font-black text-2xl md:text-3xl uppercase tracking-wide">{activeGov.name}</h3>
                  </div>
                  <p className="font-body text-sm text-muted leading-relaxed mb-2">{activeGov.desc}</p>
                  <div className="font-mono text-xs text-muted2">Місія: <span className="text-white/70">{activeGov.mission}</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Ranks */}
              <div className="p-5 md:col-span-1">
                <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Ієрархія</div>
                <div className="flex flex-col gap-2">
                  {activeGov.ranks.map(r => (
                    <div key={r.n} className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-cyan mt-0.5 flex-shrink-0">{r.n}</span>
                      <div>
                        <div className="font-condensed font-bold text-sm">{r.name}</div>
                        <div className="font-body text-xs text-muted2">{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="p-5">
                <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Вимоги для вступу</div>
                <ul className="flex flex-col gap-2">
                  {activeGov.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan font-mono text-xs mt-0.5 flex-shrink-0">→</span>
                      <span className="font-body text-sm text-muted">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divisions */}
              <div className="p-5">
                <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Підрозділи</div>
                <ul className="flex flex-col gap-2">
                  {activeGov.divisions.map((div, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan font-mono text-xs mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-body text-sm text-muted">{div}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-mono text-[10px] text-muted2">Подати заявку можна через Discord або форум проекту у відповідному розділі.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Criminal Structures */}
      <div className="mb-12">
        <div className="font-mono text-xs font-bold tracking-widest text-orange uppercase mb-1">Підпілля</div>
        <h2 className="font-display text-4xl md:text-5xl uppercase mb-2">Кримінальні структури</h2>
        <p className="font-body text-sm text-muted mb-6">Організовані злочинні угруповання — для тих, хто обрав темний шлях у Los Santos.</p>

        {/* Crime Tabs */}
        <div className="flex gap-px bg-border mb-px">
          {CRIME_STRUCTURES.map(s => (
            <button
              key={s.id}
              onClick={() => setCrimeTab(s.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-colors
                ${crimeTab === s.id ? 'bg-bg3 text-white' : 'bg-bg2 text-muted hover:bg-bg3 hover:text-white'}`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.tag}</span>
            </button>
          ))}
        </div>

        {activeCrime && (
          <div className="bg-bg2 border border-border overflow-hidden">
            <div className="relative p-6 md:p-8 border-b border-border">
              <div className="absolute inset-0 pointer-events-none" style={activeCrime.glowStyle} />
              <div className="relative flex flex-col md:flex-row md:items-start gap-4">
                <div className="text-5xl">{activeCrime.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border tracking-widest ${activeCrime.colorClass}`}>{activeCrime.tag}</span>
                    <h3 className="font-condensed font-black text-2xl md:text-3xl uppercase tracking-wide">{activeCrime.name}</h3>
                  </div>
                  <p className="font-body text-sm text-muted leading-relaxed mb-2">{activeCrime.desc}</p>
                  <div className="font-mono text-xs text-muted2">Стиль: <span className="text-white/70">{activeCrime.style}</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Ranks */}
              <div className="p-5">
                <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Ієрархія</div>
                <div className="flex flex-col gap-2">
                  {activeCrime.ranks.map(r => (
                    <div key={r.n} className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-orange mt-0.5 flex-shrink-0">{r.n}</span>
                      <div>
                        <div className="font-condensed font-bold text-sm">{r.name}</div>
                        <div className="font-body text-xs text-muted2">{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="p-5">
                <div className="font-mono text-xs font-bold tracking-widest text-muted uppercase mb-3">Діяльність</div>
                <ul className="flex flex-col gap-2">
                  {activeCrime.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange font-mono text-xs mt-0.5 flex-shrink-0">→</span>
                      <span className="font-body text-sm text-muted">{act}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-mono text-[10px] text-muted2">Членство в кримінальних структурах відкрите для гравців. Знайди лідера організації в грі та пройди відбір.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-4 bg-orange/5 border border-orange/25 p-4">
          <div className="flex items-start gap-3">
            <span className="text-orange text-lg flex-shrink-0">⚠</span>
            <div>
              <div className="font-condensed font-bold text-sm text-orange uppercase tracking-wide mb-1">Увага</div>
              <div className="font-body text-xs text-muted leading-relaxed">Вступ до кримінальної структури накладає обмеження на персонажа. Члени банд та мафії обмежені у доступі до деяких легальних активностей. Дотримуйтесь правил RP при відіграші кримінального персонажа.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Join CTA */}
      <div className="bg-bg2 border border-border p-8 mb-12 text-center relative overflow-hidden">
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
        {(['done', 'active', 'planned']).map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusStyle[s].dot}`} />
            <span className="font-mono text-xs text-muted">{statusStyle[s].label}</span>
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
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border tracking-widest ${st.badge}`}>{st.label}</span>
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
