import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Metadata } from 'next';
import RootLayoutClient from './layout-client';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tutha',
  description: 'Votre application de santé',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <RootLayoutClient>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#2C974B',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#E5484D',
                },
              },
            }}
          />
        </RootLayoutClient>
      </body>
    </html>
  );
}
