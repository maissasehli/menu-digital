'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [restaurantName, setRestaurantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Configuration Supabase manquante. Vérifiez votre fichier .env.local')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

      if (signUpError) {
        if (signUpError.message.includes('fetch')) {
          setError('Impossible de contacter Supabase. Vérifiez votre NEXT_PUBLIC_SUPABASE_URL dans .env.local')
        } else if (signUpError.message.includes('already registered')) {
          setError('Cet email est déjà utilisé. Connectez-vous plutôt.')
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        const slug = restaurantName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
          router.push('/verify-email')
          return
        }

        const { error: restaurantError } = await supabase
          .from('restaurants')
          .insert({ user_id: data.user.id, name: restaurantName, slug })

        if (restaurantError) {
          setError(restaurantError.message)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Erreur réseau : impossible de joindre Supabase. Vérifiez votre .env.local et votre connexion internet.')
      } else {
        setError('Une erreur inattendue est survenue. Réessayez.')
      }
    } finally {
      setLoading(false)
    }
  }

  const strengthScore = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort']
  const strengthColor = ['', '#ef4444', '#C8933A', '#22c55e']

  return (
    <div className="reg-root">

      {/* Background */}
      <div className="bg-layer" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-lines" />
      </div>

      {/* Logo */}
      <Link href="/" className="site-logo">
        Menu<span className="logo-accent">Digital</span>
      </Link>

      {/* Card */}
      <div className="card">
        <div className="card-glow" />

        {/* Steps indicator */}
        <div className="steps">
          {['Compte', 'Restaurant', 'Terminé'].map((s, i) => (
            <div key={s} className="step-item">
              <div className={`step-dot ${i === 0 ? 'step-active' : ''}`}>
                {i === 0 ? '1' : i + 1}
              </div>
              <span className={`step-label ${i === 0 ? 'step-label-active' : ''}`}>{s}</span>
              {i < 2 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Icon */}
        <div className="card-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#regGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#9B59B6" />
              </linearGradient>
            </defs>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>

        <h1 className="card-title">Créer un compte</h1>
        <p className="card-sub">Lancez votre menu digital en quelques minutes</p>

        <form onSubmit={handleRegister} className="form">

          {/* Restaurant name */}
          <div className={`field ${focused === 'restaurant' ? 'field-focused' : ''}`}>
            <label className="field-label">Nom du restaurant</label>
            <div className="field-wrap">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l19-9-9 19-2-8-8-2z" />
              </svg>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                onFocus={() => setFocused('restaurant')}
                onBlur={() => setFocused(null)}
                placeholder="Le Jasmin, Dar Zarrouk…"
                required
                className="field-input"
              />
            </div>
            {restaurantName && (
              <p className="field-hint">
                Slug : <span className="slug-preview">menudigital.tn/<strong>{restaurantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</strong></span>
              </p>
            )}
          </div>

          {/* Email */}
          <div className={`field ${focused === 'email' ? 'field-focused' : ''}`}>
            <label className="field-label">Email</label>
            <div className="field-wrap">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="vous@restaurant.com"
                required
                className="field-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className={`field ${focused === 'password' ? 'field-focused' : ''}`}>
            <label className="field-label">Mot de passe</label>
            <div className="field-wrap">
              <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Min. 6 caractères"
                minLength={6}
                required
                className="field-input"
              />
            </div>
            {/* Strength meter */}
            {password.length > 0 && (
              <div className="strength-wrap">
                <div className="strength-bars">
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      className="strength-bar"
                      style={{ background: strengthScore >= lvl ? strengthColor[strengthScore] : 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColor[strengthScore] }}>
                  {strengthLabel[strengthScore]}
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Terms */}
          <p className="terms">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/terms" className="terms-link">conditions d utilisation</Link>
          </p>

          {/* Submit */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Création en cours…
              </span>
            ) : (
              'Créer mon compte →'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span className="divider-line" />
          <span className="divider-text">ou</span>
          <span className="divider-line" />
        </div>

        {/* Login link */}
        <p className="login-prompt">
          Déjà inscrit ?{' '}
          <Link href="/login" className="login-link">Se connecter</Link>
        </p>
      </div>

      <style jsx>{`
        .reg-root {
          min-height: 100vh;
          background: #000;
          display: flex; align-items: center; justify-content: center;
          padding: 100px 24px 40px;
          position: relative; overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Background */
        .bg-layer { position: absolute; inset: 0; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(110px); opacity: 0.25; }
        .orb-1 {
          width: 480px; height: 480px;
          background: radial-gradient(circle, #FF6B35, transparent 70%);
          top: -120px; left: -160px;
          animation: drift 11s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, #9B59B6, transparent 70%);
          bottom: -80px; right: -80px;
          animation: drift 14s ease-in-out infinite alternate-reverse;
        }
        .orb-3 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #C8933A, transparent 70%);
          top: 50%; right: 20%;
          animation: drift 8s ease-in-out infinite alternate;
        }
        .grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        /* Logo */
        .site-logo {
          position: fixed; top: 28px; left: 32px;
          font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
          color: #fff; text-decoration: none; z-index: 50;
        }
        .logo-accent {
          background: linear-gradient(90deg, #FF6B35, #FFA552, #C8933A, #E056C1, #9B59B6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* Card */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 440px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          padding: 40px 40px 36px;
          box-shadow:
            0 40px 80px rgba(0,0,0,0.8),
            0 0 0 1px rgba(255,255,255,0.04),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .card-glow {
          position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
          width: 220px; height: 2px;
          background: linear-gradient(90deg, transparent, #FF6B35, #C8933A, #9B59B6, transparent);
          border-radius: 100px;
        }

        /* Steps */
        .steps {
          display: flex; align-items: center; justify-content: center;
          gap: 0; margin-bottom: 28px;
        }
        .step-item { display: flex; align-items: center; gap: 6px; }
        .step-dot {
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.25);
        }
        .step-active {
          background: linear-gradient(135deg, #FF6B35, #9B59B6);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 0 16px rgba(255,107,53,0.4);
        }
        .step-label { font-size: 11px; color: rgba(255,255,255,0.2); font-weight: 500; }
        .step-label-active { color: rgba(255,255,255,0.7); }
        .step-line { width: 28px; height: 1px; background: rgba(255,255,255,0.08); margin: 0 4px; }

        /* Header */
        .card-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: rgba(255,107,53,0.08);
          border: 1px solid rgba(255,107,53,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
        }
        .card-title {
          text-align: center;
          font-size: 24px; font-weight: 800; letter-spacing: -0.8px;
          color: #fff; margin-bottom: 8px;
        }
        .card-sub {
          text-align: center; font-size: 14px;
          color: rgba(255,255,255,0.38); margin-bottom: 32px; line-height: 1.5;
        }

        /* Form */
        .form { display: flex; flex-direction: column; gap: 14px; }
        .field { display: flex; flex-direction: column; gap: 7px; }
        .field-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.35); transition: color 0.2s;
        }
        .field-focused .field-label { color: #FF8C42; }
        .field-wrap { position: relative; display: flex; align-items: center; }
        .field-icon {
          position: absolute; left: 14px;
          color: rgba(255,255,255,0.22); pointer-events: none; transition: color 0.2s;
        }
        .field-focused .field-icon { color: #FF6B35; }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 13px;
          padding: 12px 14px 12px 40px;
          font-size: 14px; color: #fff; outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          font-family: inherit;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.18); }
        .field-focused .field-input {
          border-color: rgba(255,107,53,0.45);
          background: rgba(255,107,53,0.04);
          box-shadow: 0 0 0 4px rgba(255,107,53,0.07);
        }

        /* Slug preview */
        .field-hint { font-size: 11px; color: rgba(255,255,255,0.25); padding-left: 2px; }
        .slug-preview { color: rgba(255,255,255,0.4); }
        .slug-preview strong { color: #FF8C42; font-weight: 600; }

        /* Strength meter */
        .strength-wrap { display: flex; align-items: center; gap: 8px; padding-left: 2px; }
        .strength-bars { display: flex; gap: 4px; }
        .strength-bar { width: 32px; height: 3px; border-radius: 10px; transition: background 0.3s; }
        .strength-label { font-size: 11px; font-weight: 600; transition: color 0.3s; }

        /* Error */
        .error-box {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 12px 14px;
          font-size: 13px; color: #f87171; line-height: 1.5;
        }
        .error-box svg { flex-shrink: 0; margin-top: 1px; }

        /* Terms */
        .terms { font-size: 12px; color: rgba(255,255,255,0.25); text-align: center; margin-top: 2px; }
        .terms-link {
          color: rgba(255,255,255,0.4); text-decoration: underline;
          text-underline-offset: 2px; transition: color 0.2s;
        }
        .terms-link:hover { color: #FF8C42; }

        /* Submit */
        .submit-btn {
          width: 100%; padding: 14px;
          border: none; border-radius: 14px;
          font-size: 15px; font-weight: 700; letter-spacing: 0.02em;
          color: #fff; cursor: pointer;
          background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 20%, #C8933A 50%, #9B59B6 100%);
          box-shadow: 0 6px 30px rgba(255,107,53,0.38), 0 0 0 1px rgba(255,107,53,0.15);
          position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          margin-top: 4px; font-family: inherit;
        }
        .submit-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255,107,53,0.5), 0 0 0 1px rgba(255,107,53,0.25);
        }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-loading { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }

        /* Divider */
        .divider { display: flex; align-items: center; gap: 12px; margin: 22px 0 18px; }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text { font-size: 12px; color: rgba(255,255,255,0.22); white-space: nowrap; }

        /* Login */
        .login-prompt { text-align: center; font-size: 14px; color: rgba(255,255,255,0.32); }
        .login-link {
          background: linear-gradient(90deg, #FF6B35, #C8933A, #9B59B6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          font-weight: 700; text-decoration: none; transition: opacity 0.2s;
        }
        .login-link:hover { opacity: 0.75; }

        /* Animations */
        @keyframes drift {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(20px,14px) scale(1.05); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .card { padding: 32px 22px; border-radius: 22px; }
          .reg-root { padding-top: 80px; }
        }
      `}</style>
    </div>
  )
}