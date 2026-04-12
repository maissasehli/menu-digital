'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message) } else { router.push('/dashboard') }
    setLoading(false)
  }

  return (
    <div className="login-root">

      {/* Background orbs */}
      <div className="bg-layer" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-lines" />
      </div>

      {/* Logo top-left */}
      <Link href="/" className="site-logo">
        Menu<span className="logo-accent">Digital</span>
      </Link>

      {/* Card */}
      <div className="card">
        {/* Card inner glow */}
        <div className="card-glow" />

        {/* Icon */}
        <div className="card-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#iconGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#9B59B6" />
              </linearGradient>
            </defs>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h1 className="card-title">Connexion</h1>
        <p className="card-sub">Bienvenue — accédez à votre espace restaurant</p>

        <form onSubmit={handleLogin} className="form">

          {/* Email field */}
          <div className={`field ${focused === 'email' ? 'field-focused' : ''}`}>
            <label className="field-label">Email</label>
            <div className="field-wrap">
              <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Password field */}
          <div className={`field ${focused === 'password' ? 'field-focused' : ''}`}>
            <label className="field-label">Mot de passe</label>
            <div className="field-wrap">
              <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
                className="field-input"
              />
            </div>
          </div>

          {/* Forgot password */}
          <div className="field-footer">
            <Link href="/forgot-password" className="forgot-link">Mot de passe oublié ?</Link>
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

          {/* Submit */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Connexion en cours…
              </span>
            ) : (
              'Se connecter →'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span className="divider-line" />
          <span className="divider-text">ou</span>
          <span className="divider-line" />
        </div>

        {/* Register link */}
        <p className="register-prompt">
          Pas encore de compte ?{' '}
          <Link href="/register" className="register-link">Créer un compte</Link>
        </p>
      </div>

      {/* Styles */}
      <style jsx>{`
        /* ── Base ── */
        .login-root {
          min-height: 100vh;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* ── Background ── */
        .bg-layer { position: absolute; inset: 0; pointer-events: none; }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(100px); opacity: 0.28;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #FF6B35, transparent 70%);
          top: -150px; left: -150px;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #9B59B6, transparent 70%);
          bottom: -100px; right: -100px;
          animation: drift 9s ease-in-out infinite alternate-reverse;
        }
        .grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        /* ── Logo ── */
        .site-logo {
          position: absolute; top: 28px; left: 32px;
          font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
          color: #fff; text-decoration: none;
          z-index: 10;
        }
        .logo-accent {
          background: linear-gradient(90deg, #FF6B35, #FFA552, #C8933A, #E056C1, #9B59B6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* ── Card ── */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 420px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          padding: 44px 40px;
          box-shadow:
            0 40px 80px rgba(0,0,0,0.8),
            0 0 0 1px rgba(255,255,255,0.04),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .card-glow {
          position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
          width: 200px; height: 2px;
          background: linear-gradient(90deg, transparent, #FF6B35, #C8933A, #9B59B6, transparent);
          border-radius: 100px;
        }

        /* ── Header ── */
        .card-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(255,107,53,0.08);
          border: 1px solid rgba(255,107,53,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .card-title {
          text-align: center;
          font-size: 26px; font-weight: 800; letter-spacing: -0.8px;
          color: #fff; margin-bottom: 8px;
        }
        .card-sub {
          text-align: center;
          font-size: 14px; color: rgba(255,255,255,0.4);
          margin-bottom: 36px;
          line-height: 1.5;
        }

        /* ── Form ── */
        .form { display: flex; flex-direction: column; gap: 16px; }

        .field { display: flex; flex-direction: column; gap: 7px; }
        .field-label {
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          transition: color 0.2s;
        }
        .field-focused .field-label { color: #FF8C42; }
        .field-wrap {
          position: relative; display: flex; align-items: center;
        }
        .field-icon {
          position: absolute; left: 14px;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          transition: color 0.2s;
        }
        .field-focused .field-icon { color: #FF6B35; }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 13px 16px 13px 42px;
          font-size: 15px; color: #fff;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          font-family: inherit;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .field-focused .field-input {
          border-color: rgba(255,107,53,0.45);
          background: rgba(255,107,53,0.04);
          box-shadow: 0 0 0 4px rgba(255,107,53,0.08);
        }

        /* ── Forgot link ── */
        .field-footer { display: flex; justify-content: flex-end; margin-top: -6px; }
        .forgot-link { font-size: 12px; color: rgba(255,255,255,0.35); text-decoration: none; transition: color 0.2s; }
        .forgot-link:hover { color: #FF8C42; }

        /* ── Error ── */
        .error-box {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 12px 14px;
          font-size: 13px; color: #f87171;
        }

        /* ── Submit ── */
        .submit-btn {
          width: 100%; padding: 15px;
          border: none; border-radius: 14px;
          font-size: 15px; font-weight: 700; letter-spacing: 0.02em;
          color: #fff; cursor: pointer;
          background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 20%, #C8933A 50%, #9B59B6 100%);
          box-shadow: 0 6px 30px rgba(255,107,53,0.4), 0 0 0 1px rgba(255,107,53,0.15);
          position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          margin-top: 4px;
          font-family: inherit;
        }
        .submit-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255,107,53,0.5), 0 0 0 1px rgba(255,107,53,0.25);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Loading spinner */
        .btn-loading { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }

        /* ── Divider ── */
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0 20px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text { font-size: 12px; color: rgba(255,255,255,0.25); white-space: nowrap; }

        /* ── Register ── */
        .register-prompt { text-align: center; font-size: 14px; color: rgba(255,255,255,0.35); }
        .register-link {
          background: linear-gradient(90deg, #FF6B35, #C8933A, #9B59B6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          font-weight: 700; text-decoration: none;
          transition: opacity 0.2s;
        }
        .register-link:hover { opacity: 0.8; }

        /* ── Animations ── */
        @keyframes drift {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(24px,16px) scale(1.06); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .card { padding: 36px 24px; border-radius: 24px; }
          .site-logo { top: 20px; left: 20px; }
        }
      `}</style>
    </div>
  )
}