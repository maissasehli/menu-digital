import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MenuDigital — Menus QR pour restaurants',
  description:
    'Créez votre menu digital accessible via QR code. Sans application, sans friction. Conçu pour les restaurants en Tunisie et la région MENA.',
  keywords: ['menu digital', 'QR code restaurant', 'menu en ligne', 'Tunisie', 'MENA'],
  authors: [{ name: 'MenuDigital' }],
  openGraph: {
    title: 'MenuDigital — Menus QR pour restaurants',
    description: 'Menu digital via QR code pour cafés, restaurants et hôtels.',
    type: 'website',
    images: [{ url: '/og-image.jpg' }],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      {/*
       * suppressHydrationWarning on <body> suppresses mismatches caused by
       * browser extensions (Liner, Grammarly, etc.) that inject attributes
       * at runtime. We do NOT hard-code extension attributes — that's brittle
       * and gets outdated with every extension update.
       */}
      <body
        className="bg-[#0D0D0D] text-[#F5F0E8] font-body antialiased"
        suppressHydrationWarning
      >
        {/* ── Grain texture overlay ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* ── Global ambient glow ── */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#C8933A]/10 blur-[120px]" />
        </div>

        {/* ── Page content ── */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}