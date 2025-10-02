import nextDynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/hero-section';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Defer below-the-fold sections to separate chunks
const TechStackSection = nextDynamic(() =>
  import('@/components/home/tech-stack-section').then(
    (m) => m.TechStackSection,
  ),
);
const ComponentShowcase = nextDynamic(() =>
  import('@/components/home/component-showcase').then(
    (m) => m.ComponentShowcase,
  ),
);
const ProjectOverview = nextDynamic(() =>
  import('@/components/home/project-overview').then((m) => m.ProjectOverview),
);
const CallToAction = nextDynamic(() =>
  import('@/components/home/call-to-action').then((m) => m.CallToAction),
);

export default function Home() {
  return (
    <div className='bg-background text-foreground min-h-screen'>
      <HeroSection />
      <TechStackSection />
      <ComponentShowcase />
      <ProjectOverview />
      <CallToAction />
    </div>
  );
}
