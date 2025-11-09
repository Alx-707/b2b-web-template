import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessagesComplete } from '@/lib/i18n/server/getMessagesComplete';

interface ContactLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Contact page layout that provides complete translation messages.
 *
 * This layout wraps the contact page with a NextIntlClientProvider that has
 * access to all translations (not just critical ones). This is necessary because
 * the contact page uses translations that are in the deferred.json file.
 */
export default async function ContactLayout({
  children,
  params,
}: ContactLayoutProps) {
  const { locale } = await params;
  const messages = await getMessagesComplete(locale as 'en' | 'zh');

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
