'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getHomeStats } from '@/lib/stats'

const { restaurantCount, countryCount, satisfaction } = await getHomeStats()



// ─── Floating QR mock ────────────────────────────────────────────────────────
function QRMock() {
  return (
    <div className="qr-wrap">
      <div className="qr-inner">
        <div className="grid-dots">
          {Array.from({ length: 49 }).map((_, i) => {
            const on = [0,1,2,3,4,5,6,7,14,21,28,35,42,43,44,45,46,47,48,8,15,22,10,12,16,23,25,30,37,33,38,40].includes(i)
            return <div key={i} className={`dot ${on ? 'dot-on' : 'dot-off'}`} />
          })}
        </div>
        <div className="qr-center">
          <span className="qr-letter">M</span>
        </div>
      </div>
    </div>
  )
}

// ─── Animated counter — hidden until in view, no "0+" flash ──────────────────
function Counter({ end, label }: { end: number; label: string }) {
  const [val, setVal] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        obs.disconnect()
        let start = 0
        const step = Math.ceil(end / 60)
        const id = setInterval(() => {
          start += step
          if (start >= end) {
            setVal(end)
            clearInterval(id)
          } else {
            setVal(start)
          }
        }, 16)
      },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])

  return (
    <div ref={ref} className="counter">
      {/* Reserve space so layout doesn't jump; show dash until animated */}
      <div className="counter-val" style={{ opacity: val === null ? 0 : 1, transition: 'opacity 0.2s' }}>
        {val ?? end}+
      </div>
      <div className="counter-label">{label}</div>
    </div>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon, title, desc, accent,
}: {
  icon: string; title: string; desc: string; accent: string
}) {
  return (
    <div className={`feat-card feat-${accent}`}>
      <div className="feat-glow" />
      <div className="feat-icon">{icon}</div>
      <h3 className="feat-title">{title}</h3>
      <p className="feat-desc">{desc}</p>
    </div>
  )
}

// ─── Pricing card ─────────────────────────────────────────────────────────────
function PricingCard({
  name, price, period, features, highlight,
}: {
  name: string; price: string; period: string; features: string[]; highlight?: boolean
}) {
  return (
    <div className={`price-card ${highlight ? 'price-highlight' : ''}`}>
      {highlight && <div className="price-badge">Populaire</div>}
      <div className="price-tier">{name}</div>
      <div className="price-amount">{price}</div>
      <div className="price-period">{period}</div>
      <ul className="price-list">
        {features.map((f, i) => (
          <li key={i} className="price-item">
            <span className="price-bullet" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`price-btn ${highlight ? 'price-btn-hot' : 'price-btn-ghost'}`}
      >
        Commencer
      </Link>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="root">

      {/* ── Navbar ── */}
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <span className="logo">Menu<span className="logo-accent">Digital</span></span>
          <div className="nav-links">
            <a href="#features" className="nav-link">Fonctionnalités</a>
            <a href="#pricing" className="nav-link">Tarifs</a>
            <a href="#stack" className="nav-link">Stack</a>
          </div>
          <div className="nav-actions">
            <Link href="/login" className="nav-login">Connexion</Link>
            <Link href="/register" className="nav-cta">Démarrer →</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="grid-lines" />
        </div>

        <div className="hero-content">
          {/* Left */}
          <div className="hero-left">
            

            <h1 className="hero-h1">
              Votre menu,
              <br />
              <span className="grad-text">sans friction.</span>
            </h1>

            <p className="hero-sub">
              Un menu digital accessible via QR code — sans application, sans inscription.
              Conçu pour les restaurants de Tunisie et de la région MENA.
            </p>

            <div className="hero-btns">
              <Link href="/register" className="btn-primary">
                Créer mon menu gratuit
              </Link>
              <Link href="/login" className="btn-ghost">
                Déjà inscrit →
              </Link>
            </div>

            <div className="stats">
              <Counter end={restaurantCount} label="Restaurants" />
              <div className="stats-sep" />
              <Counter end={countryCount} label="Pays" />
              <div className="stats-sep" />
              <Counter end={satisfaction}label="Satisfaction" />
            </div>
          </div>

          {/* Right — 3D Phone */}
          <div className="hero-right">
            <div className="phone-scene">
              <div className="ring ring-1" />
              <div className="ring ring-2" />
              <div className="ring ring-3" />

              <div className="phone">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div className="screen-header">
                    <p className="screen-name">Le Jasmin</p>
                    <p className="screen-sub">Cuisine Tunisienne</p>
                  </div>
                  <div className="screen-tabs">
                    {['Entrées', 'Plats', 'Desserts'].map((t, i) => (
                      <span key={t} className={`tab ${i === 1 ? 'tab-active' : ''}`}>{t}</span>
                    ))}
                  </div>
                  {[
                    { name: 'Couscous Royal', price: '12.500' },
                    { name: "Brik à l'œuf", price: '4.500' },
                    { name: 'Ojja Merguez', price: '9.000' },
                  ].map((item) => (
                    <div key={item.name} className="screen-item">
                      <div>
                        <p className="item-name">{item.name}</p>
                        <p className="item-price">{item.price} TND</p>
                      </div>
                      <div className="item-add">+</div>
                    </div>
                  ))}
                </div>
                <div className="phone-bar" />
              </div>

              <div className="qr-float">
                <QRMock />
              </div>

              <div className="float-badge">
                <span className="float-dot" />
                Menu actif
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="section">
        <div className="section-inner">
          <p className="section-eyebrow">Fonctionnalités</p>
          <h2 className="section-h2">Tout ce dont votre<br />restaurant a besoin</h2>
          <div className="feat-grid">
            <FeatureCard icon="📋" title="Gestion du menu" desc="Créez et modifiez vos catégories, plats, descriptions et prix en temps réel." accent="amber" />
            <FeatureCard icon="📸" title="Photos des plats" desc="Intégrez des photos via Cloudinary pour donner envie à vos clients." accent="orange" />
            <FeatureCard icon="🌐" title="Multilingue" desc="Affichez votre menu en arabe, français et anglais selon la préférence du client." accent="violet" />
            <FeatureCard icon="📱" title="QR Code unique" desc="Générez automatiquement un QR code imprimable, propre à votre restaurant." accent="rose" />
            <FeatureCard icon="⚡" title="Mises à jour instantanées" desc="Activez ou désactivez un plat en un clic — le menu se met à jour immédiatement." accent="amber" />
            <FeatureCard icon="🎨" title="Design personnalisé" desc="Couleurs, logo, typographie aux couleurs de votre identité visuelle." accent="orange" />
          </div>
        </div>
      </section>

      {/* ── Color strip ── */}
      <div className="color-strip" aria-hidden="true">
        <div className="strip-inner">
          {['#FF6B35','#FF8C42','#FFA552','#C8933A','#A0785A','#9B59B6','#7D3C98','#E74C3C','#FF6B35'].map((c, i) => (
            <div key={i} className="strip-block" style={{ background: c }} />
          ))}
        </div>
        <div className="strip-fade-l" />
        <div className="strip-fade-r" />
      </div>

      {/* ── Pricing ── */}
      <section id="pricing" className="section">
        <div className="section-inner">
          <p className="section-eyebrow">Tarifs</p>
          <h2 className="section-h2">Simple et transparent</h2>
          <div className="price-grid">
            <PricingCard
              name="Setup de base"
              price="300–500 $"
              period="Paiement unique"
              features={['Création du menu complet', 'QR code imprimable', '1 session de formation', 'Support 30 jours']}
            />
            <PricingCard
              name="Abonnement"
              price="10–15 $"
              period="Par mois"
              features={['Mises à jour illimitées', 'Support prioritaire', 'Statistiques de consultation', 'Sauvegarde automatique']}
              highlight
            />
            <PricingCard
              name="Pack premium"
              price="700–900 $"
              period="Paiement unique"
              features={['Design sur mesure', 'Menu trilingue complet', 'Photos professionnelles', 'Formation complète']}
            />
          </div>
        </div>
      </section>

      {/* ── Stack ── */}
      <section id="stack" className="section">
        <div className="section-inner" style={{ maxWidth: '860px' }}>
          <p className="section-eyebrow">Stack Technique</p>
          <h2 className="section-h2">Construit sur des technologies modernes</h2>
          <div className="stack-grid">
            {[
              { name: 'Next.js', role: 'Frontend', col: '#E2E8F0' },
              { name: 'Tailwind CSS', role: 'Styles', col: '#06B6D4' },
              { name: 'Supabase', role: 'Backend & Auth', col: '#3ECF8E' },
              { name: 'Cloudinary', role: 'Images', col: '#3448C5' },
              { name: 'Vercel', role: 'Hébergement', col: '#E2E8F0' },
              { name: 'qrcode.react', role: 'QR Code', col: '#FF6B35' },
            ].map((tech) => (
              <div key={tech.name} className="stack-card">
                <div
                  className="stack-pip"
                  style={{ background: tech.col, boxShadow: `0 0 10px ${tech.col}80` }}
                />
                <div>
                  <div className="stack-name">{tech.name}</div>
                  <div className="stack-role">{tech.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-glow" />
          <h2 className="cta-h2">Prêt à digitaliser votre menu ?</h2>
          <p className="cta-sub">Rejoignez les premiers restaurants à offrir une expérience moderne à leurs clients.</p>
          <Link href="/register" className="btn-primary btn-xl">
            Créer mon menu maintenant
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="logo">Menu<span className="logo-accent">Digital</span></span>
          <p className="footer-copy">© 2026 MenuDigital —  Tunisie & MENA</p>
        </div>
      </footer>

    </div>
  )
}