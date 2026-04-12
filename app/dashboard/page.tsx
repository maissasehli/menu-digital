'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Restaurant, Category, Item } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ CORRIGÉ : loadData déclarée AVANT useEffect avec useCallback
  const loadData = useCallback(async (userId: string) => {
    let { data: resto } = await supabase
      .from('restaurants').select('*').eq('user_id', userId).maybeSingle()

    if (!resto) {
      const { data: newResto } = await supabase
        .from('restaurants')
        .insert({ user_id: userId, name: 'Mon Restaurant', slug: `restaurant-${userId.slice(0, 8)}` })
        .select().single()
      resto = newResto
    }

    if (!resto) { router.push('/login'); return }

    const [{ data: cats }, { data: allItems }] = await Promise.all([
      supabase.from('categories').select('*').eq('restaurant_id', resto.id).order('position'),
      supabase.from('items').select('*, categories!inner(restaurant_id)').eq('categories.restaurant_id', resto.id),
    ])

    setRestaurant(resto)
    setCategories(cats || [])
    setItems(allItems || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          if (!session) { router.push('/login'); return }
          await loadData(session.user.id)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [router, loadData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="load-screen">
      <div className="load-inner">
        <div className="load-spinner" />
        <p className="load-text">Chargement…</p>
      </div>
      <style jsx>{`
        .load-screen { min-height: 100vh; background: #000; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }
        .load-inner { display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .load-spinner { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,107,53,0.2); border-top-color: #FF6B35; animation: spin 0.8s linear infinite; }
        .load-text { font-size: 13px; color: rgba(255,255,255,0.3); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )

  const available = items.filter(i => i.is_available).length

  return (
    <div className="dash-root">

      {/* Background */}
      <div className="dash-bg" aria-hidden="true">
        <div className="dash-orb dash-orb-1" />
        <div className="dash-orb dash-orb-2" />
        <div className="dash-grid" />
      </div>

      {/* ── Navbar ── */}
      <nav className="dash-nav">
        <div className="dash-nav-inner">
          <Link href="/" className="logo">
            Menu<span className="logo-accent">Digital</span>
          </Link>
          <div className="nav-right">
            <div className="resto-pill">
              <span className="resto-dot" />
              {restaurant?.name}
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="dash-content">

        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <h1 className="dash-h1">Bonjour 👋</h1>
            <p className="dash-sub">Gérez le menu de <span className="dash-resto">{restaurant?.name}</span></p>
          </div>
          <Link href={`/menu/${restaurant?.slug}`} target="_blank" className="preview-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Voir le menu
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="stats-grid">
          {[
            { label: 'Catégories', value: categories.length, icon: '◈', color: '#C8933A' },
            { label: 'Plats total', value: items.length, icon: '◉', color: '#FF6B35' },
            { label: 'Disponibles', value: available, icon: '◎', color: '#22c55e' },
            { label: 'Indisponibles', value: items.length - available, icon: '◌', color: '#9B59B6' },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
              <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-bar" style={{ background: `linear-gradient(90deg, ${stat.color}40, transparent)` }} />
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div className="actions-grid">

          {/* Catégories */}
          <Link href="/dashboard/categories" className="action-card">
            <div className="action-top">
              <div className="action-icon-wrap action-amber">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <span className="action-arrow">→</span>
            </div>
            <h3 className="action-title">Catégories</h3>
            <p className="action-desc">Créer et organiser vos catégories</p>
            <div className="action-count">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</div>
          </Link>

          {/* Plats */}
          <Link href="/dashboard/items" className="action-card">
            <div className="action-top">
              <div className="action-icon-wrap action-orange">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
              </div>
              <span className="action-arrow">→</span>
            </div>
            <h3 className="action-title">Plats</h3>
            <p className="action-desc">Ajouter et modifier vos plats</p>
            <div className="action-count">{items.length} plat{items.length !== 1 ? 's' : ''}</div>
          </Link>

          {/* QR Code */}
          <Link href="/dashboard/qrcode" className="action-card">
            <div className="action-top">
              <div className="action-icon-wrap action-rose">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
                </svg>
              </div>
              <span className="action-arrow">→</span>
            </div>
            <h3 className="action-title">QR Code</h3>
            <p className="action-desc">Générer et télécharger votre QR code imprimable</p>
            <div className="action-count">1 code unique</div>
          </Link>

          {/* Voir menu public */}
          <Link href={`/menu/${restaurant?.slug}`} target="_blank" className="action-card action-card-hot">
            <div className="action-top">
              <div className="action-icon-wrap action-violet">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <span className="action-arrow">↗</span>
            </div>
            <h3 className="action-title">Voir mon menu</h3>
            <p className="action-desc">Aperçu public de votre menu</p>
            <div className="action-live"><span className="live-dot" />En ligne</div>
          </Link>

        </div>

        {/* ── Recent items ── */}
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3 className="empty-title">Votre menu est vide</h3>
            <p className="empty-sub">Commencez par créer des catégories, puis ajoutez vos plats.</p>
            <Link href="/dashboard/categories" className="empty-btn">
              Créer une catégorie →
            </Link>
          </div>
        ) : (
          <div className="recent-section">
            <div className="recent-header">
              <h2 className="recent-title">Derniers plats</h2>
              <Link href="/dashboard/items" className="recent-link">Voir tout →</Link>
            </div>
            <div className="recent-list">
              {items.slice(0, 5).map((item, i) => (
                <div key={item.id} className={`recent-item ${i !== 0 ? 'recent-item-border' : ''}`}>
                  <div className="recent-item-left">
                    <div className="recent-item-avatar">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="recent-item-name">{item.name}</p>
                      {item.description && <p className="recent-item-desc">{item.description}</p>}
                    </div>
                  </div>
                  <div className="recent-item-right">
                    <span className="recent-price">{item.price} TND</span>
                    <span className={`avail-badge ${item.is_available ? 'avail-yes' : 'avail-no'}`}>
                      {item.is_available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        .dash-root { min-height: 100vh; background: #000; font-family: 'Inter', -apple-system, sans-serif; position: relative; overflow-x: hidden; }

        .dash-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .dash-orb { position: absolute; border-radius: 50%; filter: blur(130px); opacity: 0.12; }
        .dash-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #FF6B35, transparent 70%); top: -200px; left: -200px; }
        .dash-orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #9B59B6, transparent 70%); bottom: -150px; right: -150px; }
        .dash-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .dash-nav { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); }
        .dash-nav-inner { max-width: 1200px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #fff; text-decoration: none; }
        .logo-accent { background: linear-gradient(90deg, #FF6B35, #FFA552, #C8933A, #9B59B6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .resto-pill { display: flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 100px; padding: 6px 14px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.65); }
        .resto-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; }
        .logout-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 7px 14px; font-size: 13px; color: rgba(255,255,255,0.35); cursor: pointer; transition: color 0.2s, border-color 0.2s; font-family: inherit; }
        .logout-btn:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.15); }

        .dash-content { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 48px 24px 80px; }

        .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; gap: 16px; flex-wrap: wrap; }
        .dash-h1 { font-size: 32px; font-weight: 800; letter-spacing: -1px; color: #fff; margin-bottom: 6px; }
        .dash-sub { font-size: 15px; color: rgba(255,255,255,0.38); }
        .dash-resto { background: linear-gradient(90deg, #FF6B35, #C8933A); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 600; }
        .preview-btn { display: flex; align-items: center; gap: 7px; text-decoration: none; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 18px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); transition: all 0.2s; white-space: nowrap; }
        .preview-btn:hover { border-color: rgba(255,107,53,0.35); color: #fff; background: rgba(255,107,53,0.06); }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .stat-card { position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); border-radius: 20px; padding: 22px 20px; transition: border-color 0.3s, transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.12); }
        .stat-icon { font-size: 18px; margin-bottom: 12px; }
        .stat-value { font-size: 38px; font-weight: 800; letter-spacing: -1.5px; line-height: 1; margin-bottom: 6px; }
        .stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
        .stat-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; }

        .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 40px; }
        .action-card { display: block; text-decoration: none; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); border-radius: 20px; padding: 24px; transition: all 0.3s; }
        .action-card:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.055); transform: translateY(-3px); }
        .action-card-hot { border-color: rgba(255,107,53,0.2); background: rgba(255,107,53,0.04); }
        .action-card-hot:hover { border-color: rgba(255,107,53,0.35); background: rgba(255,107,53,0.08); }
        .action-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .action-icon-wrap { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .action-amber { background: rgba(200,147,58,0.12); color: #C8933A; border: 1px solid rgba(200,147,58,0.2); }
        .action-orange { background: rgba(255,107,53,0.12); color: #FF6B35; border: 1px solid rgba(255,107,53,0.2); }
        .action-violet { background: rgba(155,89,182,0.12); color: #9B59B6; border: 1px solid rgba(155,89,182,0.2); }
        .action-rose { background: rgba(224,86,193,0.12); color: #E056C1; border: 1px solid rgba(224,86,193,0.2); }
        .action-arrow { font-size: 18px; color: rgba(255,255,255,0.2); transition: transform 0.2s, color 0.2s; }
        .action-card:hover .action-arrow { transform: translate(2px, -2px); color: rgba(255,255,255,0.5); }
        .action-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .action-desc { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 14px; line-height: 1.5; }
        .action-count { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.25); }
        .action-live { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #22c55e; }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: pulse 2s infinite; }

        .empty-state { border: 1px dashed rgba(255,255,255,0.1); border-radius: 24px; padding: 72px 40px; text-align: center; }
        .empty-icon { font-size: 48px; margin-bottom: 20px; }
        .empty-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .empty-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 28px; max-width: 340px; margin-left: auto; margin-right: auto; line-height: 1.6; }
        .empty-btn { display: inline-block; text-decoration: none; background: linear-gradient(135deg, #FF6B35, #C8933A, #9B59B6); color: #fff; font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 14px; box-shadow: 0 6px 24px rgba(255,107,53,0.35); transition: transform 0.2s, box-shadow 0.2s; }
        .empty-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(255,107,53,0.45); }

        .recent-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .recent-title { font-size: 18px; font-weight: 700; color: #fff; }
        .recent-link { font-size: 13px; color: rgba(255,255,255,0.35); text-decoration: none; transition: color 0.2s; }
        .recent-link:hover { color: #FF8C42; }
        .recent-list { border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02); border-radius: 20px; overflow: hidden; }
        .recent-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; transition: background 0.2s; }
        .recent-item:hover { background: rgba(255,255,255,0.03); }
        .recent-item-border { border-top: 1px solid rgba(255,255,255,0.05); }
        .recent-item-left { display: flex; align-items: center; gap: 14px; }
        .recent-item-avatar { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: linear-gradient(135deg, rgba(255,107,53,0.15), rgba(155,89,182,0.15)); border: 1px solid rgba(255,107,53,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #FF8C42; }
        .recent-item-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .recent-item-desc { font-size: 12px; color: rgba(255,255,255,0.28); }
        .recent-item-right { display: flex; align-items: center; gap: 10px; }
        .recent-price { font-size: 13px; font-weight: 700; background: linear-gradient(90deg, #FF6B35, #C8933A); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .avail-badge { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px; }
        .avail-yes { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .avail-no { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.07); }

        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1100px) { .actions-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .dash-header { flex-direction: column; gap: 12px; } }
        @media (max-width: 560px) { .actions-grid { grid-template-columns: 1fr; } .recent-item-right { flex-direction: column; align-items: flex-end; gap: 6px; } .dash-content { padding: 32px 16px 60px; } }
      `}</style>
    </div>
  )
}