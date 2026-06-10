import type { Metadata } from 'next';
import {
  Cinzel,
  Cormorant_Garamond,
  League_Spartan,
  Bebas_Neue,
} from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/layout/Providers';
import { Navbar } from '@/components/layout/Navbar';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
});

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  variable: '--font-league',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
});

export const metadata: Metadata = {
  title: 'Jukebox - Listen Together',
  description: 'Real-time collaborative music listening platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${cinzel.variable}
          ${cormorant.variable}
          ${leagueSpartan.variable}
          ${bebas.variable}
          bg-background text-foreground antialiased
        `}
      >
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}