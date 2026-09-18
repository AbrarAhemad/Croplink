import type { Metadata } from 'next';
import './globals.css';
import { AppStoreProvider } from '@/lib/store/use-app-store';
import { I18nProvider } from '@/lib/i18n/context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CropLink - From Farm to Industry. Fairly Connected.',
  description: 'B2B Agricultural Marketplace strengthening market linkages, live AGMARKNET price discovery, anonymous bidding, sample verification, and delivery tracking.',
  openGraph: {
    title: 'CropLink - B2B Agricultural Marketplace',
    description: 'Direct market linkage for farmers and verified industrial buyers in India.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <I18nProvider>
          <AppStoreProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </AppStoreProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
