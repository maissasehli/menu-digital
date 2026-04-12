'use client'

import { useState } from 'react'
import type { Restaurant, Category, Item } from '@/types'

type Lang = 'fr' | 'ar' | 'en'

const translations = {
  fr: {
    search: 'Rechercher un plat…',
    available: 'Disponible',
    noItems: 'Aucun plat disponible dans cette catégorie.',
    allCats: 'Tout',
    tnd: 'TND',
    poweredBy: 'Propulsé par MenuDigital',
  },
  ar: {
    search: 'ابحث عن طبق…',
    available: 'متاح',
    noItems: 'لا توجد أطباق متاحة.',
    allCats: 'الكل',
    tnd: 'د.ت',
    poweredBy: 'مدعوم من MenuDigital',
  },
  en: {
    search: 'Search a dish…',
    available: 'Available',
    noItems: 'No dishes available in this category.',
    allCats: 'All',
    tnd: 'TND',
    poweredBy: 'Powered by MenuDigital',
  },
}

export default function MenuClient({
  restaurant,
  categories,
  items,
}: {
  restaurant: Restaurant
  categories: Category[]
  items: Item[]
}) {
  const [lang, setLang] = useState<Lang>('fr')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const tx = translations[lang]

  const getName = (item: Item | Category): string => {
    if (lang === 'ar' && 'name_ar' in item && item.name_ar) return item.name_ar
    if (lang === 'en' && 'name_en' in item && item.name_en) return item.name_en
    return item.name
  }

  const filtered = items.filter((item) => {
    const matchCat =
      activeCategory === 'all' || item.category_id === activeCategory
    const matchSearch = getName(item)
      .toLowerCase()
      .includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const primaryColor = restaurant.primary_color || '#FF6B35'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0a0a; }

        .menu-root {
          min-height: 100vh;
          background: #0a0a0a;
          color: #fff;
          font-family: ${lang === 'ar'
            ? "'Cairo', 'Noto Sans Arabic', sans-serif"
            : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"};
        }

        .menu-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(10,10,10,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 14px 16px 0;
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 12px;
        }

        .resto-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .resto-avatar {
          width: 44px; height: 44px; min-width: 44px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 900; color: #fff; flex-shrink: 0;
          background: linear-gradient(135deg, ${primaryColor}, #9B59B6);
        }

        .resto-name {
          font-size: 17px; font-weight: 800; letter-spacing: -0.4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .resto-desc {
          font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .lang-switcher {
          display: flex; gap: 3px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 3px; flex-shrink: 0;
        }

        .lang-btn {
          background: none; border: none; border-radius: 100px;
          padding: 5px 10px; font-size: 10px; font-weight: 700;
          letter-spacing: 0.06em; color: rgba(255,255,255,0.35);
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }

        .lang-btn.active {
          background: linear-gradient(135deg, ${primaryColor}, #C8933A);
          color: #fff;
        }

        .search-wrap { position: relative; margin-bottom: 14px; }

        .search-icon {
          position: absolute;
          left: ${dir === 'rtl' ? 'auto' : '13px'};
          right: ${dir === 'rtl' ? '13px' : 'auto'};
          top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.25); pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: ${dir === 'rtl' ? '11px 40px 11px 14px' : '11px 14px 11px 40px'};
          font-size: 14px; color: #fff; outline: none;
          font-family: inherit; transition: border-color 0.2s, background 0.2s;
        }

        .search-input::placeholder { color: rgba(255,255,255,0.22); }
        .search-input:focus {
          border-color: rgba(255,107,53,0.45);
          background: rgba(255,107,53,0.04);
        }

        .cat-tabs {
          display: flex; gap: 8px; overflow-x: auto;
          padding-bottom: 14px; scrollbar-width: none; -ms-overflow-style: none;
        }
        .cat-tabs::-webkit-scrollbar { display: none; }

        .cat-tab {
          flex-shrink: 0;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 100px; padding: 7px 16px;
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.4); cursor: pointer;
          transition: all 0.2s; font-family: inherit; white-space: nowrap;
        }

        .cat-tab:hover { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.15); }
        .cat-tab.active {
          background: rgba(255,107,53,0.15);
          border-color: rgba(255,107,53,0.4);
          color: ${primaryColor};
        }

        .menu-main { max-width: 700px; margin: 0 auto; padding: 20px 14px 100px; }

        .result-count {
          font-size: 12px; color: rgba(255,255,255,0.25);
          margin-bottom: 14px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; padding-left: 2px;
        }

        .items-list { display: flex; flex-direction: column; gap: 10px; }

        .item-card {
          display: flex;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          border-radius: 16px; overflow: hidden;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          animation: fadeIn 0.3s ease both;
        }

        .item-card:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.05);
          transform: translateY(-1px);
        }

        .item-img-wrap {
          width: 96px; min-height: 96px; flex-shrink: 0;
          overflow: hidden; background: rgba(255,255,255,0.04);
        }

        .item-img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .item-img-placeholder {
          width: 96px; min-height: 96px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .item-body {
          flex: 1; padding: 14px 16px;
          display: flex; flex-direction: column;
          justify-content: space-between; gap: 8px; min-width: 0;
        }

        .item-name { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.92); line-height: 1.3; }

        .item-desc {
          font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .item-footer {
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
        }

        .item-price {
          font-size: 16px; font-weight: 800; letter-spacing: -0.3px;
          background: linear-gradient(90deg, ${primaryColor}, #C8933A);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .item-avail {
          font-size: 10px; font-weight: 700;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #22c55e; padding: 3px 10px;
          border-radius: 100px; white-space: nowrap;
        }

        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 60px 20px; text-align: center;
        }
        .empty-icon { font-size: 40px; }
        .empty-text { font-size: 14px; color: rgba(255,255,255,0.3); line-height: 1.6; max-width: 280px; }

        .menu-footer {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(10,10,10,0.9);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 12px 16px; text-align: center;
          font-size: 11px; color: rgba(255,255,255,0.2);
          font-weight: 500; letter-spacing: 0.04em;
        }

        .footer-brand {
          background: linear-gradient(90deg, ${primaryColor}, #C8933A);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; font-weight: 700;
        }

        @media (max-width: 480px) {
          .resto-name { font-size: 15px; }
          .item-img-wrap, .item-img-placeholder { width: 80px; min-height: 80px; }
          .item-name { font-size: 14px; }
          .item-price { font-size: 14px; }
          .menu-main { padding: 16px 12px 100px; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="menu-root" dir={dir}>
        <header className="menu-header">
          <div className="header-top">
            <div className="resto-info">
              <div className="resto-avatar">
                {restaurant.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="resto-name">{restaurant.name}</div>
                {restaurant.description && (
                  <div className="resto-desc">{restaurant.description}</div>
                )}
              </div>
            </div>
            <div className="lang-switcher">
              {(['fr', 'ar', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`lang-btn${lang === l ? ' active' : ''}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx.search}
            />
          </div>

          <div className="cat-tabs">
            <button
              className={`cat-tab${activeCategory === 'all' ? ' active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              {tx.allCats} ({items.length})
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.category_id === cat.id).length
              return (
                <button
                  key={cat.id}
                  className={`cat-tab${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {getName(cat)} ({count})
                </button>
              )
            })}
          </div>
        </header>

        <main className="menu-main">
          {filtered.length > 0 && (
            <div className="result-count">
              {filtered.length} plat{filtered.length > 1 ? 's' : ''}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <p className="empty-text">{tx.noItems}</p>
            </div>
          ) : (
            <div className="items-list">
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  className="item-card"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {item.image_url ? (
                    <div className="item-img-wrap">
                      <img
                        src={item.image_url}
                        alt={getName(item)}
                        className="item-img"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="item-img-placeholder">🍴</div>
                  )}

                  <div className="item-body">
                    <div>
                      <div className="item-name">{getName(item)}</div>
                      {item.description && (
                        <div className="item-desc">{item.description}</div>
                      )}
                    </div>
                    <div className="item-footer">
                      <span className="item-price">
                        {item.price} {tx.tnd}
                      </span>
                      <span className="item-avail">{tx.available}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="menu-footer">
          {tx.poweredBy.split('MenuDigital')[0]}
          <span className="footer-brand">MenuDigital</span>
        </footer>
      </div>
    </>
  )
}