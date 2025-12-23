import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TitanFit Cloud',
  description: 'TitanFit Cloud Training Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
