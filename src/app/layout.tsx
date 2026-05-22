import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TIS - The Innovators Studio',
  description: 'Pioneer Plaque - The Innovators Studio',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-premium">
        {children}
      </body>
    </html>
  );
}
