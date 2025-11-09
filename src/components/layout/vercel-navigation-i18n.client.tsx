'use client';

import dynamic from 'next/dynamic';
import { ClientI18nProvider } from '@/components/i18n/client-i18n-provider';

const VercelNavigation = dynamic(
  () =>
    import('@/components/layout/vercel-navigation').then(
      (m) => m.VercelNavigation,
    ),
  { ssr: false },
);

export function VercelNavigationI18n({ locale }: { locale?: 'en' | 'zh' }) {
  return (
    <ClientI18nProvider locale={locale}>
      <VercelNavigation />
    </ClientI18nProvider>
  );
}
