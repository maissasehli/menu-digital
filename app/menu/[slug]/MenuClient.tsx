'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Restaurant, Category, Item } from '@/types'

type Lang = 'fr' | 'ar' | 'en'

type Translatable = {
  name: string
  name_ar?: string | null
  name_en?: string | null
}

const T = {
  fr: { search: 'Rechercher un plat…', all: 'Tout le menu', tnd: 'TND', noItems: 'Aucun résultat.', available: 'Disponible', by: 'Propulsé par', brand: 'MENUDIGITAL' },
  ar: { search: 'ابحث عن طبق…', all: 'القائمة الكاملة', tnd: 'د.ت', noItems: 'لا توجد نتائج.', available: 'متاح', by: 'مدعوم من', brand: 'MENUDIGITAL' },
  en: { search: 'Search a dish…', all: 'Full menu', tnd: 'TND', noItems: 'No results.', available: 'Available', by: 'Powered by', brand: 'MENUDIGITAL' },
}

const FONTS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  .mh-tabs { display: flex; overflow-x: auto; scrollbar-width: none; gap: 4px; padding-bottom: 14px; }
  .mh-tabs::-webkit-scrollbar { display: none; }

  .mi { animation: up .35s ease both; }
  .mi-img img { transition: transform .5s; }
  .mi:hover .mi-img img { transform: scale(1.08); }
  .mi-zoom { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; opacity: 0; transition: all .25s; }
  .mi:hover .mi-zoom { background: rgba(0,0,0,.25); opacity: 1; }

  .mi-desc { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  @keyframes up      { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(.93); } to { opacity: 1; transform: scale(1); } }

  @media (max-width: 480px) {
    .mi-img-box, .mi-placeholder { width: 85px !important; min-height: 85px !important; }
  }
`

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const ZoomIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
)

const PlaceholderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0a592" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
)

const padNum = (n: number) => String(n).padStart(2, '0')

export default function MenuClient({
  restaurant,
  categories,
  items,
}: {
  restaurant: Restaurant
  categories: Category[]
  items: Item[]
}) {
  const [lang, setLang]                     = useState<Lang>('fr')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch]                 = useState('')
  const [lightbox, setLightbox]             = useState<Item | null>(null)
  const [scrolled, setScrolled]             = useState(false)
  const tabsRef                             = useRef<HTMLDivElement>(null)
  const headerRef                           = useRef<HTMLElement>(null)

  const tx      = T[lang]
  const isRtl   = lang === 'ar'
  const dir     = isRtl ? 'rtl' : 'ltr'
  const primary = restaurant.primary_color || '#8a6c3a'

  // Derived colors
  const acc2 = primary + '22'
  const acc3 = primary + '55'

  // Design tokens as JS objects (no CSS classes for stateful things)
  const C = {
    bg:      '#f5f0e8',
    s1:      '#ede8de',
    s2:      '#e4ddd1',
    s3:      '#d9d1c4',
    border:  'rgba(100,80,50,0.10)',
    border2: 'rgba(100,80,50,0.18)',
    border3: 'rgba(100,80,50,0.28)',
    txt:     '#1c1610',
    muted:   '#7a6e5f',
    dim:     '#b0a592',
    green:   '#3a7d57',
  }

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* lock body when lightbox open */
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  /* close lightbox on Escape */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const getName = useCallback((obj: Translatable) => {
    if (lang === 'ar') return obj.name_ar || obj.name
    if (lang === 'en') return obj.name_en || obj.name
    return obj.name
  }, [lang])

  const filtered = items.filter(i =>
    getName(i).toLowerCase().includes(search.toLowerCase())
  )

  const groups = categories
    .map((cat, ci) => ({
      cat,
      ci,
      dishes: filtered.filter(i => i.category_id === cat.id),
    }))
    .filter(g => g.dishes.length > 0)

  const scrollTab = (id: string) => {
    setActiveCategory(id)

    const btn = tabsRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })

    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const section      = document.getElementById(`section-${id}`)
    const headerHeight = headerRef.current?.clientHeight ?? 0
    if (!section) return

    const top = section.getBoundingClientRect().top + window.scrollY - headerHeight - 16
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // ── Inline style objects ─────────────────────────────────────────────────

  const sHeader: React.CSSProperties = {
    background: C.bg,
    borderBottom: `1px solid ${scrolled ? C.border2 : C.border}`,
    boxShadow: scrolled ? '0 6px 32px rgba(100,80,50,0.10)' : 'none',
    position: 'sticky', top: 0, zIndex: 100,
    transition: 'border-color .3s, box-shadow .3s',
  }

  const sHeaderInner: React.CSSProperties = {
    maxWidth: 760, margin: '0 auto', padding: '16px 20px 0',
  }

  const sHeaderTop: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14,
  }

  const sLogo: React.CSSProperties = {
    width: 44, height: 44, flexShrink: 0,
    borderRadius: 10, background: C.s2,
    border: `1px solid ${C.border2}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    fontSize: 24, letterSpacing: '.05em', color: primary,
  }

  const sName: React.CSSProperties = {
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    fontSize: 20, letterSpacing: '.08em',
    color: C.txt, lineHeight: 1,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }

  const sDesc: React.CSSProperties = {
    fontSize: 10.5, color: C.muted,
    letterSpacing: '.18em', textTransform: 'uppercase',
    marginTop: 5, fontWeight: 300,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }

  const sLangs: React.CSSProperties = {
    display: 'flex', gap: 1,
    background: C.s2, border: `1px solid ${C.border2}`,
    borderRadius: 8, padding: 3, flexShrink: 0,
  }

  const sLangBtn = (active: boolean): React.CSSProperties => ({
    background: active ? primary : 'transparent',
    border: 'none',
    padding: '5px 12px', borderRadius: 6,
    fontSize: 10, fontWeight: 500, letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: active ? '#fff' : C.muted,
    cursor: 'pointer',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'all .2s',
  })

  const sSearchWrap: React.CSSProperties = {
    paddingBottom: 12, position: 'relative',
  }

  const sSearchIcon: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    pointerEvents: 'none', color: C.dim,
    ...(isRtl ? { right: 14 } : { left: 14 }),
  }

  const sInput: React.CSSProperties = {
    width: '100%',
    background: C.s1, border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, color: C.txt,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontWeight: 300, outline: 'none',
    padding: '10px 14px',
    transition: 'border-color .2s',
    ...(isRtl ? { paddingRight: 38, paddingLeft: 14 } : { paddingLeft: 38, paddingRight: 14 }),
  }

  const sTabBtn = (active: boolean): React.CSSProperties => ({
    flexShrink: 0,
    background: active ? primary : 'transparent',
    border: `1px solid ${active ? primary : C.border}`,
    borderRadius: 6,
    padding: '6px 16px', fontSize: 11,
    fontWeight: active ? 500 : 400,
    letterSpacing: '.1em', textTransform: 'uppercase',
    color: active ? '#fff' : C.muted,
    cursor: 'pointer',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'all .2s', whiteSpace: 'nowrap',
  })

  const sMain: React.CSSProperties = {
    maxWidth: 760, margin: '0 auto', padding: '36px 20px 100px',
  }

  const sGroup: React.CSSProperties = { marginBottom: 52 }

  const sGroupHead: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28,
  }

  const sGroupNum: React.CSSProperties = {
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    fontSize: 64, lineHeight: 1,
    color: 'rgba(100,80,50,0.10)', flexShrink: 0,
    userSelect: 'none', letterSpacing: '-.02em',
  }

  const sGroupInfo: React.CSSProperties = {
    flex: 1, minWidth: 0,
    borderLeft: `2px solid ${primary}`,
    paddingLeft: 16,
  }

  const sGroupTitle: React.CSSProperties = {
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    fontSize: 28, letterSpacing: '.1em', color: C.txt, lineHeight: 1,
  }

  const sGroupCount: React.CSSProperties = {
    fontSize: 10.5, color: C.muted,
    letterSpacing: '.16em', textTransform: 'uppercase',
    marginTop: 5, fontWeight: 300,
  }

  const sItem: React.CSSProperties = {
    display: 'flex', background: C.s1,
    border: `1px solid ${C.border}`, borderRadius: 12,
    overflow: 'hidden', marginBottom: 2,
    transition: 'border-color .25s, background .25s',
  }

  const sImgBox: React.CSSProperties = {
    width: 110, minHeight: 110, flexShrink: 0,
    overflow: 'hidden', position: 'relative',
    background: C.s2, cursor: 'zoom-in',
  }

  const sImgStyle: React.CSSProperties = {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
  }

  const sPlaceholder: React.CSSProperties = {
    width: 110, minHeight: 110, flexShrink: 0,
    background: C.s2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  const sPhIcon: React.CSSProperties = {
    width: 28, height: 28, borderRadius: '50%',
    border: `1px solid ${C.border2}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  const sBody: React.CSSProperties = {
    flex: 1, padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0,
  }

  const sItemName: React.CSSProperties = {
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 18, fontWeight: 400, fontStyle: 'italic',
    lineHeight: 1.2, color: C.txt,
  }

  const sItemDesc: React.CSSProperties = {
    fontSize: 12, color: C.muted, lineHeight: 1.7, fontWeight: 300, flex: 1,
  }

  const sFooter: React.CSSProperties = {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 4,
  }

  const sPriceBlock: React.CSSProperties = {
    display: 'flex', alignItems: 'baseline', gap: 5,
  }

  const sPrice: React.CSSProperties = {
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    fontSize: 22, letterSpacing: '.03em', color: primary,
  }

  const sCurrency: React.CSSProperties = {
    fontSize: 10, color: C.muted,
    letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 300,
  }

  const sAvail: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
  }

  const sDot: React.CSSProperties = {
    width: 6, height: 6, borderRadius: '50%',
    background: C.green, flexShrink: 0,
  }

  const sAvailLbl: React.CSSProperties = {
    fontSize: 10, color: C.green,
    letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400,
  }

  const sEmpty: React.CSSProperties = {
    textAlign: 'center', padding: '80px 20px',
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 22, fontStyle: 'italic', color: C.dim,
  }

  const sLightbox: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 300,
    background: 'rgba(20,15,10,0.88)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, animation: 'fadeIn .2s ease',
  }

  const sLbClose: React.CSSProperties = {
    position: 'absolute', top: 20, right: 20,
    width: 40, height: 40, borderRadius: '50%',
    background: C.s2, border: `1px solid ${C.border2}`,
    color: C.muted, fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'all .2s',
  }

  const sLbImg: React.CSSProperties = {
    maxWidth: 'min(88vw, 580px)', maxHeight: '78vh',
    borderRadius: 10, objectFit: 'contain',
    animation: 'scaleIn .25s ease',
  }

  const sLbCap: React.CSSProperties = {
    position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontSize: 16, fontStyle: 'italic',
    color: C.txt, background: C.bg,
    border: `1px solid ${C.border2}`,
    padding: '8px 20px', borderRadius: 8, whiteSpace: 'nowrap',
  }

  const sPageFooter: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: C.bg, borderTop: `1px solid ${C.border}`,
    padding: '11px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }

  const sFooterDot: React.CSSProperties = {
    width: 4, height: 4, borderRadius: '50%',
    background: primary, opacity: .5,
  }

  const sFooterBy: React.CSSProperties = {
    fontSize: 10, color: C.dim,
    letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 300,
  }

  const sFooterBrand: React.CSSProperties = {
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    fontSize: 13, letterSpacing: '.12em', color: primary,
  }

  // ────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{FONTS_CSS}</style>

      <div dir={dir} style={{ background: C.bg, color: C.txt, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>

        {/* ── HEADER ── */}
        <header ref={headerRef} style={sHeader}>
          <div style={sHeaderInner}>

            {/* top row */}
            <div style={sHeaderTop}>
              <div style={sLogo}>
                {restaurant.logo_url
                  ? <img src={restaurant.logo_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : restaurant.name.charAt(0).toUpperCase()
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={sName}>{restaurant.name}</div>
                {restaurant.description && (
                  <div style={sDesc}>{restaurant.description}</div>
                )}
              </div>

              {/* ✅ FIX: style inline React — fonctionne sur toute IP */}
              <div style={sLangs}>
                {(['fr', 'ar', 'en'] as Lang[]).map(l => (
                  <button
                    key={l}
                    style={sLangBtn(lang === l)}
                    onClick={() => setLang(l)}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* search */}
            <div style={sSearchWrap}>
              <span style={sSearchIcon}><SearchIcon /></span>
              <input
                style={sInput}
                placeholder={tx.search}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* ✅ FIX: category tabs — style inline React */}
            <div className="mh-tabs" ref={tabsRef}>
              <button
                data-id="all"
                style={sTabBtn(activeCategory === 'all')}
                onClick={() => scrollTab('all')}
              >
                {tx.all}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  data-id={cat.id}
                  style={sTabBtn(activeCategory === cat.id)}
                  onClick={() => scrollTab(cat.id)}
                >
                  {getName(cat)}
                </button>
              ))}
            </div>

          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={sMain}>
          {groups.length === 0 ? (
            <div style={sEmpty}>— {tx.noItems} —</div>
          ) : (
            groups.map(({ cat, ci, dishes }) => (
              <section key={cat.id} id={`section-${cat.id}`} style={sGroup}>

                <div style={sGroupHead}>
                  <div style={sGroupNum}>{padNum(ci + 1)}</div>
                  <div style={sGroupInfo}>
                    <div style={sGroupTitle}>{getName(cat).toUpperCase()}</div>
                    <div style={sGroupCount}>
                      {dishes.length}&nbsp;plat{dishes.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {dishes.map((item, ii) => (
                  <div
                    key={item.id}
                    className="mi"
                    style={{ ...sItem, animationDelay: `${ii * 60}ms` }}
                  >
                    {item.image_url ? (
                      <div
                        className="mi-img-box"
                        style={sImgBox}
                        onClick={() => setLightbox(item)}
                        role="button"
                        aria-label={`Agrandir ${getName(item)}`}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setLightbox(item)}
                      >
                        <img src={item.image_url} alt={getName(item)} loading="lazy" style={sImgStyle} />
                        <div className="mi-zoom"><ZoomIcon /></div>
                      </div>
                    ) : (
                      <div className="mi-placeholder" style={sPlaceholder}>
                        <div style={sPhIcon}><PlaceholderIcon /></div>
                      </div>
                    )}

                    <div style={sBody}>
                      <div style={sItemName}>{getName(item)}</div>
                      {item.description && (
                        <div className="mi-desc" style={sItemDesc}>{item.description}</div>
                      )}
                      <div style={sFooter}>
                        <div style={sPriceBlock}>
                          <span style={sPrice}>{Number(item.price).toFixed(3)}</span>
                          <span style={sCurrency}>{tx.tnd}</span>
                        </div>
                        <div style={sAvail}>
                          <div style={sDot} />
                          <span style={sAvailLbl}>{tx.available}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </section>
            ))
          )}
        </main>

        {/* ── LIGHTBOX ── */}
        {lightbox && (
          <div
            style={sLightbox}
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={getName(lightbox)}
          >
            <button
              style={sLbClose}
              onClick={e => { e.stopPropagation(); setLightbox(null) }}
              aria-label="Fermer"
            >
              ✕
            </button>
            <img
              style={sLbImg}
              src={lightbox.image_url!}
              alt={getName(lightbox)}
              onClick={e => e.stopPropagation()}
            />
            <div style={sLbCap}>{getName(lightbox)}</div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer style={sPageFooter}>
          <div style={sFooterDot} />
          <span style={sFooterBy}>{tx.by}</span>
          <span style={sFooterBrand}>{tx.brand}</span>
          <div style={sFooterDot} />
        </footer>

      </div>
    </>
  )
}