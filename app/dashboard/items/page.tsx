'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Restaurant, Category, Item } from '@/types'

export default function ItemsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '' })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: resto } = await supabase.from('restaurants').select('*').eq('user_id', session.user.id).single()
      if (!resto) { router.push('/login'); return }
      const [{ data: cats }, { data: allItems }] = await Promise.all([
        supabase.from('categories').select('*').eq('restaurant_id', resto.id).order('position'),
        supabase.from('items').select('*, categories!inner(restaurant_id)').eq('categories.restaurant_id', resto.id),
      ])
      setRestaurant(resto)
      setCategories(cats || [])
      setItems(allItems || [])
      if (cats && cats.length > 0) setForm(f => ({ ...f, category_id: cats[0].id }))
      setLoading(false)
    }
    load()
  }, [router])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category_id) return
    setSaving(true)
    const { data } = await supabase.from('items').insert({
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      is_available: true,
      position: items.length,
    }).select().single()
    if (data) setItems([...items, data])
    setForm(f => ({ ...f, name: '', description: '', price: '' }))
    setSaving(false)
  }

  const toggleAvailable = async (item: Item) => {
    await supabase.from('items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(items.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  const handleDelete = async (id: string) => {
    await supabase.from('items').delete().eq('id', id)
    setItems(items.filter(i => i.id !== id))
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

  const filteredItems = filterCat === 'all' ? items : items.filter(i => i.category_id === filterCat)
  const available = items.filter(i => i.is_available).length

  return (
    <div className="items-root">

      {/* Background */}
      <div className="items-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-overlay" />
      </div>

      {/* Navbar */}
      <nav className="items-nav">
        <div className="items-nav-inner">
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

      <div className="items-content">

        {/* Header */}
        <div className="items-header">
          <div className="items-header-left">
            <div className="items-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <div>
              <h1 className="items-h1">Plats</h1>
              <p className="items-sub">Gérez les plats de votre menu</p>
            </div>
          </div>
          {/* Mini stats */}
          <div className="mini-stats">
            <div className="mini-stat">
              <span className="mini-stat-val">{items.length}</span>
              <span className="mini-stat-label">Total</span>
            </div>
            <div className="mini-sep" />
            <div className="mini-stat">
              <span className="mini-stat-val mini-green">{available}</span>
              <span className="mini-stat-label">Dispo</span>
            </div>
            <div className="mini-sep" />
            <div className="mini-stat">
              <span className="mini-stat-val mini-dim">{items.length - available}</span>
              <span className="mini-stat-label">Indispo</span>
            </div>
          </div>
        </div>

        {/* Add form */}
        {categories.length === 0 ? (
          <div className="no-cats-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Créez d abord une catégorie avant d ajouter des plats.
            <Link href="/dashboard/categories" className="no-cats-link">Créer →</Link>
          </div>
        ) : (
          <div className="form-card">
            <div className="form-card-glow" />
            <h2 className="form-card-title">Ajouter un plat</h2>
            <form onSubmit={handleAdd} className="items-form">
              <div className="form-grid">
                {/* Name */}
                <div className={`form-field ${focusedField === 'name' ? 'form-field-focused' : ''}`}>
                  <label className="form-label">Nom du plat</label>
                  <div className="form-input-wrap">
                    <svg className="form-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <input
                      value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                      placeholder="Couscous Royal, Brik…" required className="form-input"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className={`form-field ${focusedField === 'price' ? 'form-field-focused' : ''}`}>
                  <label className="form-label">Prix (TND)</label>
                  <div className="form-input-wrap">
                    <span className="form-prefix">TND</span>
                    <input
                      value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                      onFocus={() => setFocusedField('price')} onBlur={() => setFocusedField(null)}
                      placeholder="12.500" type="number" step="0.001" required className="form-input form-input-prefix"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className={`form-field ${focusedField === 'desc' ? 'form-field-focused' : ''}`}>
                  <label className="form-label">Description <span className="form-optional">optionnel</span></label>
                  <div className="form-input-wrap">
                    <input
                      value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      onFocus={() => setFocusedField('desc')} onBlur={() => setFocusedField(null)}
                      placeholder="Ingrédients, allergènes…" className="form-input form-input-pl"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="form-field">
                  <label className="form-label">Catégorie</label>
                  <select
                    value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                    className="form-select"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={saving} className="add-btn">
                {saving ? <><span className="btn-spinner" /> Ajout…</> : '+ Ajouter le plat'}
              </button>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        {items.length > 0 && categories.length > 0 && (
          <div className="filter-tabs">
            <button className={`filter-tab ${filterCat === 'all' ? 'filter-tab-active' : ''}`} onClick={() => setFilterCat('all')}>
              Tous ({items.length})
            </button>
            {categories.map(c => {
              const count = items.filter(i => i.category_id === c.id).length
              return (
                <button key={c.id} className={`filter-tab ${filterCat === c.id ? 'filter-tab-active' : ''}`} onClick={() => setFilterCat(c.id)}>
                  {c.name} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Items list */}
        {filteredItems.length > 0 ? (
          <div className="items-list">
            {filteredItems.map((item, i) => {
              const cat = categories.find(c => c.id === item.category_id)
              return (
                <div key={item.id} className="item-row">
                  <div className="item-avatar">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="item-info">
                    <div className="item-info-top">
                      <p className="item-name">{item.name}</p>
                      {cat && <span className="item-cat-badge">{cat.name}</span>}
                    </div>
                    {item.description && <p className="item-desc">{item.description}</p>}
                  </div>
                  <div className="item-actions">
                    <span className="item-price">{item.price} TND</span>
                    <button
                      onClick={() => toggleAvailable(item)}
                      className={`toggle-btn ${item.is_available ? 'toggle-on' : 'toggle-off'}`}
                    >
                      <span className="toggle-dot" />
                      {item.is_available ? 'Disponible' : 'Indisponible'}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="del-btn" title="Supprimer">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : items.length > 0 ? (
          <div className="empty-filter">Aucun plat dans cette catégorie.</div>
        ) : null}

      </div>

      <style jsx>{`
        .items-root { min-height: 100vh; background: #000; font-family: 'Inter', -apple-system, sans-serif; position: relative; overflow-x: hidden; }

        /* Bg */
        .items-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.1; }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #FF6B35, transparent 70%); top: -100px; right: -100px; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #9B59B6, transparent 70%); bottom: -100px; left: -80px; }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 55px 55px; }

        /* Nav */
        .items-nav { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); }
        .items-nav-inner { max-width: 1100px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #fff; text-decoration: none; }
        .logo-accent { background: linear-gradient(90deg, #FF6B35, #FFA552, #C8933A, #9B59B6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .back-link { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.35); text-decoration: none; transition: color 0.2s; }
        .back-link:hover { color: rgba(255,255,255,0.7); }

        /* Content */
        .items-content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 48px 24px 80px; }

        /* Header */
        .items-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; gap: 16px; flex-wrap: wrap; }
        .items-header-left { display: flex; align-items: center; gap: 16px; }
        .items-header-icon { width: 52px; height: 52px; border-radius: 16px; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2); display: flex; align-items: center; justify-content: center; color: #FF6B35; flex-shrink: 0; }
        .items-h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.8px; color: #fff; margin-bottom: 4px; }
        .items-sub { font-size: 14px; color: rgba(255,255,255,0.35); }

        /* Mini stats */
        .mini-stats { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 12px 20px; }
        .mini-stat { text-align: center; }
        .mini-stat-val { display: block; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #fff; }
        .mini-green { color: #22c55e !important; }
        .mini-dim { color: rgba(255,255,255,0.3) !important; }
        .mini-stat-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.08em; }
        .mini-sep { width: 1px; height: 28px; background: rgba(255,255,255,0.07); }

        /* No cats banner */
        .no-cats-banner { display: flex; align-items: center; gap: 10px; border: 1px solid rgba(255,200,50,0.2); background: rgba(255,200,50,0.05); border-radius: 14px; padding: 16px 20px; font-size: 14px; color: rgba(255,220,100,0.8); margin-bottom: 28px; }
        .no-cats-link { margin-left: auto; font-weight: 700; color: #C8933A; text-decoration: none; transition: opacity 0.2s; }
        .no-cats-link:hover { opacity: 0.75; }

        /* Form card */
        .form-card { position: relative; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); border-radius: 22px; padding: 28px; margin-bottom: 32px; backdrop-filter: blur(10px); overflow: hidden; }
        .form-card-glow { position: absolute; top: -1px; left: 50%; transform: translateX(-50%); width: 180px; height: 2px; background: linear-gradient(90deg, transparent, #FF6B35, #C8933A, transparent); border-radius: 100px; }
        .form-card-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.4); letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 20px; }
        .items-form {}
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
        .form-field { display: flex; flex-direction: column; gap: 7px; }
        .form-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.3); transition: color 0.2s; }
        .form-field-focused .form-label { color: #FF8C42; }
        .form-input-wrap { position: relative; display: flex; align-items: center; }
        .form-icon { position: absolute; left: 13px; color: rgba(255,255,255,0.2); pointer-events: none; transition: color 0.2s; }
        .form-field-focused .form-icon { color: #FF6B35; }
        .form-prefix { position: absolute; left: 13px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.25); pointer-events: none; }
        .form-optional { font-weight: 400; color: rgba(255,255,255,0.2); text-transform: none; letter-spacing: 0; font-size: 10px; }
        .form-input {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 13px; padding: 12px 14px 12px 36px;
          font-size: 14px; color: #fff; outline: none; font-family: inherit;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .form-input-prefix { padding-left: 44px; }
        .form-input-pl { padding-left: 14px; }
        .form-input::placeholder { color: rgba(255,255,255,0.16); }
        .form-field-focused .form-input { border-color: rgba(255,107,53,0.4); background: rgba(255,107,53,0.04); box-shadow: 0 0 0 4px rgba(255,107,53,0.06); }
        .form-select {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 13px; padding: 12px 14px; font-size: 14px; color: #fff;
          outline: none; font-family: inherit; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
        }
        .form-select option { background: #1a1a1a; }
        .form-select:focus { border-color: rgba(255,107,53,0.4); box-shadow: 0 0 0 4px rgba(255,107,53,0.06); }
        .add-btn {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #FF6B35, #C8933A, #9B59B6);
          border: none; border-radius: 13px; padding: 13px 24px;
          font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 20px rgba(255,107,53,0.3);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }
        .add-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,107,53,0.4); }
        .add-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Filter tabs */
        .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-tab { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; padding: 7px 16px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .filter-tab:hover { color: rgba(255,255,255,0.65); border-color: rgba(255,255,255,0.14); }
        .filter-tab-active { background: rgba(255,107,53,0.12); border-color: rgba(255,107,53,0.35); color: #FF8C42; }

        /* Items list */
        .items-list { display: flex; flex-direction: column; gap: 8px; }
        .item-row {
          display: flex; align-items: center; gap: 14px;
          border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03);
          border-radius: 16px; padding: 16px 20px;
          transition: border-color 0.2s, background 0.2s;
        }
        .item-row:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); }
        .item-avatar {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(255,107,53,0.12), rgba(155,89,182,0.12));
          border: 1px solid rgba(255,107,53,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: #FF8C42;
        }
        .item-info { flex: 1; min-width: 0; }
        .item-info-top { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
        .item-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85); }
        .item-cat-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 100px; background: rgba(200,147,58,0.1); border: 1px solid rgba(200,147,58,0.2); color: #C8933A; white-space: nowrap; }
        .item-desc { font-size: 12px; color: rgba(255,255,255,0.28); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .item-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .item-price { font-size: 13px; font-weight: 800; background: linear-gradient(90deg, #FF6B35, #C8933A); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; white-space: nowrap; }
        .toggle-btn { display: flex; align-items: center; gap: 6px; border-radius: 100px; padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
        .toggle-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .toggle-on { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .toggle-on .toggle-dot { background: #22c55e; box-shadow: 0 0 5px #22c55e; }
        .toggle-on:hover { background: rgba(34,197,94,0.18); }
        .toggle-off { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.08); }
        .toggle-off .toggle-dot { background: rgba(255,255,255,0.25); }
        .toggle-off:hover { color: rgba(255,255,255,0.5); }
        .del-btn { background: none; border: 1px solid rgba(255,255,255,0.06); border-radius: 9px; padding: 7px; color: rgba(255,255,255,0.18); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .del-btn:hover { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); }

        .empty-filter { text-align: center; font-size: 14px; color: rgba(255,255,255,0.25); padding: 40px; }

        /* Spinner */
        .btn-spinner { display: inline-block; width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 800px) {
          .form-grid { grid-template-columns: 1fr; }
          .items-header { flex-direction: column; align-items: flex-start; }
          .mini-stats { align-self: stretch; justify-content: space-around; }
          .item-actions { flex-wrap: wrap; justify-content: flex-end; }
          .items-content { padding: 32px 16px 60px; }
        }
        @media (max-width: 560px) {
          .item-row { flex-wrap: wrap; }
          .item-info { min-width: 0; flex: 1 1 200px; }
          .item-actions { flex: 1; justify-content: flex-end; }
        }
      `}</style>
    </div>
  )
}