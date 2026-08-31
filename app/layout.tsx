import type { Metadata, Viewport } from 'next';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';

const display = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Duel de Dés',
  description:
    'Jeu de dés avec mise, à deux sur un même écran (pass-and-play). Aucun serveur, 100% hors-ligne.',
  applicationName: 'Duel de Dés',
  authors: [{ name: 'Duel de Dés' }],
  icons: {
    icon: [
      {
        url:
          'data:image/svg+xml,' +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230B3D2E"/><rect x="18" y="18" width="64" height="64" rx="14" fill="%23F2EFE9"/><g fill="%230B3D2E"><circle cx="36" cy="36" r="7"/><circle cx="64" cy="36" r="7"/><circle cx="50" cy="50" r="7"/><circle cx="36" cy="64" r="7"/><circle cx="64" cy="64" r="7"/></g></svg>',
          ),
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B3D2E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-[100dvh] bg-table text-cream font-body antialiased">
        {children}
      </body>
    </html>
  );
}
