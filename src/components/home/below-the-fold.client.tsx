'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ClientI18nProvider } from '@/components/i18n/client-i18n-provider';

const TechStackSection = dynamic(
  () =>
    import('@/components/home/tech-stack-section').then(
      (m) => m.TechStackSection,
    ),
  { ssr: false },
);
const ComponentShowcase = dynamic(
  () =>
    import('@/components/home/component-showcase').then(
      (m) => m.ComponentShowcase,
    ),
  { ssr: false },
);
const ProjectOverview = dynamic(
  () =>
    import('@/components/home/project-overview').then((m) => m.ProjectOverview),
  { ssr: false },
);
const CallToAction = dynamic(
  () => import('@/components/home/call-to-action').then((m) => m.CallToAction),
  { ssr: false },
);

export function BelowTheFoldClient({ locale }: { locale: 'en' | 'zh' }) {
  return (
    <Suspense fallback={null}>
      <ClientI18nProvider locale={locale}>
        <TechStackSection />
        <ComponentShowcase />
        <ProjectOverview />
        <CallToAction />
      </ClientI18nProvider>
    </Suspense>
  );
}
