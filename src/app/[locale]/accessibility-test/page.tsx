import { notFound } from 'next/navigation';
import ClientPage from '@/app/[locale]/accessibility-test/ClientPage';
import { generateLocaleStaticParams } from '@/app/[locale]/generate-static-params';

export const dynamic = 'force-dynamic';

// Avoid static pre-rendering in production; this route is for local diagnostics only
export function generateStaticParams() {
  if (process.env.NODE_ENV === 'production') {
    return [] as Array<{ locale: string }>;
  }
  return generateLocaleStaticParams();
}

export default function AccessibilityTestPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <ClientPage />;
}
