'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function VerifyEmailPage() {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="root">

      {/* Background */}
      <div className="bg-layer" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-lines" />
      </div>

      {/* Logo */}
      <Link href="/" className="site-logo">
        Menu<span className="logo-accent">Digital</span>
      </Link>

      {/* Card */}
      <div className="card">
        <div className="card-glow" />

        {/* Icon */}
        <div className="card-icon">📬</div>

        {/* Badge */}
        <div className="badge">
          <span className="badge-dot" />
          Email envoyé
        </div>

        <h1 className="card-title">Vérifiez votre email</h1>

        <p className="card-sub">
          Un lien de confirmation a été envoyé à votre adresse.
          Cliquez dessus pour activer votre compte et accéder au dashboard.
        </p>

        <div className="divider" />

        <Link
          href="/login"
          className={`back-link ${hovered ? 'back-link-hovered' : ''}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour à la connexion
        </Link>
      </div>

      <style jsx>{`
        .root {
          min-height: 100vh;
          background: #000;
          display: flex; align-items: center; justify-content: center;
          padding: 100px 24px 40px;
          position: relative; overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Background */
        .bg-layer { position: fixed; inset: 0; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(110px); opacity: 0.2; }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #FF6B35, transparent 70%);
          top: -120px; left: -160px;
          animation: drift 11s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #9B59B6, transparent 70%);
          bottom: -80px; right: -100px;
          animation: drift 14s ease-in-out infinite alternate-reverse;
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
          padding: 48px 40px;
          text-align: center;
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

        /* Icon */
        .card-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(255,107,53,0.1);
          border: 1px solid rgba(255,107,53,0.25);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          font-size: 30px;
        }

        /* Badge */
        .badge {
          display: inline-flex; align-items: center; gap: 7px;
          border: 1px solid rgba(255,107,53,0.3);
          background: rgba(255,107,53,0.07);
          padding: 5px 14px; border-radius: 100px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #FF8C42; margin-bottom: 20px;
        }
        .badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #FF6B35; display: inline-block;
        }

        /* Text */
        .card-title {
          font-size: 26px; font-weight: 800;
          letter-spacing: -0.8px; color: #fff;
          margin-bottom: 14px; line-height: 1.1;
        }
        .card-sub {
          font-size: 14px; line-height: 1.7;
          color: rgba(255,255,255,0.45);
          margin-bottom: 32px;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin-bottom: 28px;
        }

        /* Back link */
        .back-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link-hovered { color: rgba(255,255,255,0.75); }

        /* Animations */
        @keyframes drift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, 14px) scale(1.05); }
        }

        @media (max-width: 480px) {
          .card { padding: 36px 22px; border-radius: 22px; }
          .root { padding-top: 80px; }
        }
      `}</style>
    </div>
  )
}