export default function VerifyEmailPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #FF6B35, transparent 70%)', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -150 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #9B59B6, transparent 70%)', filter: 'blur(120px)', opacity: 0.1, bottom: -80, right: -100 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, margin: '0 24px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', borderRadius: 28, padding: '48px 40px', textAlign: 'center', backdropFilter: 'blur(20px)' }}>

        {/* Top glow line */}
        <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', width: 160, height: 2, background: 'linear-gradient(90deg, transparent, #FF6B35, #C8933A, transparent)', borderRadius: 100 }} />

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 30 }}>
          📬
        </div>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid rgba(255,107,53,0.3)', background: 'rgba(255,107,53,0.07)', padding: '5px 14px', borderRadius: 100, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF8C42', marginBottom: 20 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6B35', display: 'inline-block' }} />
          Email envoyé
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px', color: '#fff', marginBottom: 14, lineHeight: 1.1 }}>
          Vérifiez votre email
        </h1>

        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>
          Un lien de confirmation a été envoyé à votre adresse. Cliquez dessus pour activer votre compte et accéder au dashboard.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 28 }} />

        <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Retour à la connexion
        </a>
      </div>
    </div>
  )
}