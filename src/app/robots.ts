import type { MetadataRoute } from 'next';

// Base URL for the site - should be configured in env
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://example.com';

/**
 * Dynamic robots.txt generation for Next.js.
 * Configures search engine crawling rules.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/error-test/', '/accessibility-test/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
