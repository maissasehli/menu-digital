export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      gap: '16px',
    }}>
      <div style={{ fontSize: 48 }}>🍽️</div>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>Menu introuvable</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
        Ce restaurant n existe pas ou a été supprimé.
      </p>
    </div>
  )
}