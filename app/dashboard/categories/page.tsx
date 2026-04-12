'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Restaurant, Category } from '@/types'

export default function CategoriesPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: resto } = await supabase.from('restaurants').select('*').eq('user_id', session.user.id).single()
      if (!resto) { router.push('/login'); return }
      const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', resto.id).order('position')
      setRestaurant(resto)
      setCategories(cats || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurant || !name.trim()) return
    setSaving(true)
    const { data } = await supabase.from('categories').insert({
      restaurant_id: restaurant.id,
      name: name.trim(),
      position: categories.length,
    }).select().single()
    if (data) setCategories([...categories, data])
    setName('')
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await supabase.from('categories').delete().eq('id', id)
    setCategories(categories.filter(c => c.id !== id))
    setDeletingId(null)
  }

  if (loading) return (
    <div className="load-screen">
      <div className="load-spinner" />
      <style jsx>{`
        .load-screen { min-height: 100vh; background: #000; display: flex; align-items: center; justify-content: center; }
        .load-spinner { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(255,107,53,0.15); border-top-color: #FF6B35; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )

  return (
    <div className="cat-root">

      {/* Background */}
      <div className="cat-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-overlay" />
      </div>

      {/* Navbar */}
      <nav className="cat-nav">
        <div className="cat-nav-inner">
          <Link href="/dashboard" className="logo">
            Menu<span className="logo-accent">Digital</span>
          </Link>
          <Link href="/dashboard" className="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="cat-content">

        {/* Header */}
        <div className="cat-header">
          <div className="cat-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <div>
            <h1 className="cat-h1">Catégories</h1>
            <p className="cat-sub">Organisez votre menu en sections (Entrées, Plats, Desserts…)</p>
          </div>
        </div>

        {/* Add form */}
        <div className="form-card">
          <div className="form-card-glow" />
          <h2 className="form-card-title">Nouvelle catégorie</h2>
          <form onSubmit={handleAdd} className="add-form">
            <div className={`add-field ${focused ? 'add-field-focused' : ''}`}>
              <svg className="add-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="ex: Plats chauds, Boissons, Desserts…"
                className="add-input"
                required
              />
            </div>
            <button type="submit" disabled={saving} className="add-btn">
              {saving ? <span className="btn-spinner" /> : '+'}
              {saving ? 'Ajout…' : 'Ajouter'}
            </button>
          </form>
        </div>

        {/* Category count */}
        {categories.length > 0 && (
          <div className="cat-count">
            <span className="cat-count-num">{categories.length}</span> catégorie{categories.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* List */}
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p className="empty-text">Aucune catégorie. Ajoutez-en une ci-dessus.</p>
          </div>
        ) : (
          <div className="cat-list">
            {categories.map((cat, i) => (
              <div key={cat.id} className="cat-item">
                <div className="cat-item-left">
                  <div className="cat-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="cat-item-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                    </svg>
                  </div>
                  <span className="cat-name">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="del-btn"
                  title="Supprimer"
                >
                  {deletingId === cat.id ? (
                    <span className="btn-spinner btn-spinner-sm" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .cat-root { min-height: 100vh; background: #000; font-family: 'Inter', -apple-system, sans-serif; position: relative; overflow-x: hidden; }

        /* Bg */
        .cat-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.1; }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #C8933A, transparent 70%); top: -150px; left: -100px; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #9B59B6, transparent 70%); bottom: -100px; right: -80px; }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 55px 55px; }

        /* Nav */
        .cat-nav { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); }
        .cat-nav-inner { max-width: 860px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #fff; text-decoration: none; }
        .logo-accent { background: linear-gradient(90deg, #FF6B35, #FFA552, #C8933A, #9B59B6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .back-link { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.35); text-decoration: none; transition: color 0.2s; }
        .back-link:hover { color: rgba(255,255,255,0.7); }

        /* Content */
        .cat-content { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; padding: 48px 24px 80px; }

        /* Header */
        .cat-header { display: flex; align-items: center; gap: 16px; margin-bottom: 36px; }
        .cat-header-icon { width: 52px; height: 52px; border-radius: 16px; background: rgba(200,147,58,0.1); border: 1px solid rgba(200,147,58,0.2); display: flex; align-items: center; justify-content: center; color: #C8933A; flex-shrink: 0; }
        .cat-h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.8px; color: #fff; margin-bottom: 4px; }
        .cat-sub { font-size: 14px; color: rgba(255,255,255,0.35); }

        /* Form card */
        .form-card {
          position: relative; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
          border-radius: 20px; padding: 28px; margin-bottom: 32px;
          backdrop-filter: blur(10px); overflow: hidden;
        }
        .form-card-glow { position: absolute; top: -1px; left: 50%; transform: translateX(-50%); width: 160px; height: 2px; background: linear-gradient(90deg, transparent, #C8933A, transparent); border-radius: 100px; }
        .form-card-title { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 18px; }
        .add-form { display: flex; gap: 12px; }
        .add-field { flex: 1; position: relative; display: flex; align-items: center; transition: all 0.2s; }
        .add-icon { position: absolute; left: 14px; color: rgba(255,255,255,0.2); pointer-events: none; transition: color 0.2s; }
        .add-field-focused .add-icon { color: #C8933A; }
        .add-input {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; padding: 13px 16px 13px 40px;
          font-size: 14px; color: #fff; outline: none; font-family: inherit;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .add-input::placeholder { color: rgba(255,255,255,0.18); }
        .add-field-focused .add-input { border-color: rgba(200,147,58,0.45); background: rgba(200,147,58,0.04); box-shadow: 0 0 0 4px rgba(200,147,58,0.07); }
        .add-btn {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #FF6B35, #C8933A, #9B59B6);
          border: none; border-radius: 14px; padding: 13px 22px;
          font-size: 14px; font-weight: 700; color: #fff; cursor: pointer;
          white-space: nowrap; font-family: inherit;
          box-shadow: 0 4px 20px rgba(255,107,53,0.3);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }
        .add-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,107,53,0.4); }
        .add-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Count */
        .cat-count { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.25); letter-spacing: 0.06em; margin-bottom: 14px; padding-left: 2px; }
        .cat-count-num { font-size: 14px; color: rgba(255,255,255,0.45); font-weight: 700; }

        /* List */
        .cat-list { display: flex; flex-direction: column; gap: 8px; }
        .cat-item {
          display: flex; align-items: center; justify-content: space-between;
          border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03);
          border-radius: 16px; padding: 16px 20px;
          transition: border-color 0.2s, background 0.2s;
        }
        .cat-item:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); }
        .cat-item-left { display: flex; align-items: center; gap: 14px; }
        .cat-num { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.15); font-variant-numeric: tabular-nums; width: 24px; }
        .cat-item-icon { width: 30px; height: 30px; border-radius: 9px; background: rgba(200,147,58,0.1); border: 1px solid rgba(200,147,58,0.15); display: flex; align-items: center; justify-content: center; color: rgba(200,147,58,0.7); }
        .cat-name { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.85); }
        .del-btn {
          background: none; border: 1px solid rgba(255,255,255,0.06); border-radius: 9px;
          padding: 7px; color: rgba(255,255,255,0.2); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .del-btn:hover:not(:disabled) { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); }
        .del-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Empty */
        .empty-state { border: 1px dashed rgba(255,255,255,0.08); border-radius: 20px; padding: 60px; text-align: center; }
        .empty-icon { font-size: 40px; margin-bottom: 16px; }
        .empty-text { font-size: 14px; color: rgba(255,255,255,0.3); }

        /* Spinners */
        .btn-spinner { display: inline-block; width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; }
        .btn-spinner-sm { width: 12px; height: 12px; border-color: rgba(255,107,53,0.3); border-top-color: #FF6B35; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .cat-content { padding: 32px 16px 60px; }
          .add-form { flex-direction: column; }
          .add-btn { justify-content: center; }
          .cat-header { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>
    </div>
  )
}