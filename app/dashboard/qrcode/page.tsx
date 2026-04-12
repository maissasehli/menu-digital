'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeCanvas } from 'qrcode.react'
import type { Restaurant } from '@/types'

export default function QRCodePage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const qrRef = useRef<HTMLDivElement>(null)

  const menuUrl = restaurant
  ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/menu/${restaurant.slug}`
  : ''

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: resto } = await supabase.from('restaurants').select('*').eq('user_id', session.user.id).single()
      if (!resto) { router.push('/dashboard'); return }
      setRestaurant(resto)
      setLoading(false)
    }
    load()
  }, [router])

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${restaurant?.slug}.png`
    a.click()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid rgba(255,107,53,0.15)', borderTopColor: '#FF6B35', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div className="qr-root">
      <div className="qr-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-overlay" />
      </div>

      <nav className="qr-nav">
        <div className="qr-nav-inner">
          <Link href="/dashboard" className="logo">Menu<span className="logo-accent">Digital</span></Link>
          <Link href="/dashboard" className="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="qr-content">
        <div className="qr-header">
          <h1 className="qr-h1">QR Code</h1>
          <p className="qr-sub">Code unique pour <strong>{restaurant?.name}</strong> — à imprimer sur vos tables</p>
        </div>

        <div className="qr-card">
          <div className="qr-card-glow" />
          <div className="qr-code-wrap" ref={qrRef}>
           <QRCodeCanvas
  value={menuUrl}
  size={220}
  bgColor="#ffffff"
  fgColor="#0a0a0a"
  level="H"
  includeMargin
/>
          </div>
          <p className="qr-url">{menuUrl}</p>
          <div className="qr-actions">
            <button onClick={handleDownload} className="qr-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger PNG
            </button>
            <Link href={menuUrl} target="_blank" className="qr-btn-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Voir le menu
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .qr-root { min-height: 100vh; background: #000; font-family: 'Inter', -apple-system, sans-serif; position: relative; overflow-x: hidden; }
        .qr-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.12; }
        .orb-1 { width: 450px; height: 450px; background: radial-gradient(circle, #FF6B35, transparent 70%); top: -100px; left: -100px; }
        .orb-2 { width: 350px; height: 350px; background: radial-gradient(circle, #9B59B6, transparent 70%); bottom: -80px; right: -80px; }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 55px 55px; }
        .qr-nav { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); }
        .qr-nav-inner { max-width: 700px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #fff; text-decoration: none; }
        .logo-accent { background: linear-gradient(90deg, #FF6B35, #FFA552, #C8933A, #9B59B6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .back-link { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.35); text-decoration: none; transition: color 0.2s; }
        .back-link:hover { color: rgba(255,255,255,0.7); }
        .qr-content { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; padding: 48px 24px 80px; }
        .qr-header { margin-bottom: 36px; }
        .qr-h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.8px; color: #fff; margin-bottom: 8px; }
        .qr-sub { font-size: 14px; color: rgba(255,255,255,0.38); }
        .qr-sub strong { color: rgba(255,255,255,0.7); font-weight: 600; }
        .qr-card { position: relative; border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.03); border-radius: 24px; padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; overflow: hidden; }
        .qr-card-glow { position: absolute; top: -1px; left: 50%; transform: translateX(-50%); width: 180px; height: 2px; background: linear-gradient(90deg, transparent, #FF6B35, #C8933A, transparent); border-radius: 100px; }
        .qr-code-wrap { border-radius: 16px; overflow: hidden; box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.5); }
        .qr-url { font-size: 12px; color: rgba(255,255,255,0.3); font-family: 'Courier New', monospace; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 8px 14px; word-break: break-all; text-align: center; }
        .qr-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .qr-btn-primary { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #FF6B35, #C8933A, #9B59B6); border: none; border-radius: 13px; padding: 13px 24px; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; font-family: inherit; box-shadow: 0 4px 20px rgba(255,107,53,0.35); transition: transform 0.2s, box-shadow 0.2s; }
        .qr-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,107,53,0.45); }
        .qr-btn-ghost { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 13px; padding: 13px 24px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.6); text-decoration: none; transition: all 0.2s; }
        .qr-btn-ghost:hover { border-color: rgba(255,107,53,0.35); color: #fff; background: rgba(255,107,53,0.05); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}