'use client';

import dynamic from 'next/dynamic';
import { ClientI18nProvider } from '@/components/i18n/client-i18n-provider';

const MobileNavigation = dynamic(
  () =>
    import('@/components/layout/mobile-navigation').then(
      (m) => m.MobileNavigation,
    ),
  { ssr: false },
);

const NavSwitcher = dynamic(
  () => import('@/components/layout/nav-switcher').then((m) => m.NavSwitcher),
  { ssr: false },
);

const LanguageToggle = dynamic(
  () => import('@/components/language-toggle').then((m) => m.LanguageToggle),
  { ssr: false },
);

export function MobileNavigationIsland({ locale }: { locale: 'en' | 'zh' }) {
  // Provide i18n only for the mobile menu island
  return (
    <ClientI18nProvider locale={locale}>
      <MobileNavigation />
    </ClientI18nProvider>
  );
}

export function NavSwitcherIsland({ locale }: { locale: 'en' | 'zh' }) {
  return (
    <ClientI18nProvider locale={locale}>
      <NavSwitcher />
    </ClientI18nProvider>
  );
}

export function LanguageToggleIsland({ locale }: { locale: 'en' | 'zh' }) {
  // Pass current locale down to avoid next-intl dependency in this island
  return <LanguageToggle locale={locale} />;
}
