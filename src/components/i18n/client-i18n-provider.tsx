'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

interface ClientI18nProviderProps {
  locale?: 'en' | 'zh' | undefined;
  children: React.ReactNode;
}

/**
 * ClientI18nProvider
 *
 * Loads externalized critical messages on the client and provides
 * a NextIntlClientProvider context for children. Used to keep next-intl
 * code out of the initial vendors chunk by scoping i18n only to islands
 * and below-the-fold components that actually need it.
 */
export function ClientI18nProvider({
  locale,
  children,
}: ClientI18nProviderProps) {
  const [messages, setMessages] = useState<Record<string, unknown> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const effectiveLocale: 'en' | 'zh' =
          locale || (document.documentElement?.lang === 'zh' ? 'zh' : 'en');
        const res = await fetch(`/messages/${effectiveLocale}/critical.json`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) throw new Error(`Failed to fetch messages ${res.status}`);
        const json = (await res.json()) as Record<string, unknown>;
        if (!cancelled) setMessages(json);
      } catch {
        // Soft-fail; render children without provider if messages cannot load
        if (!cancelled) setMessages({});
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!messages) return null;

  const effectiveLocale: 'en' | 'zh' =
    locale || (document.documentElement?.lang === 'zh' ? 'zh' : 'en');

  return (
    <NextIntlClientProvider
      locale={effectiveLocale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
