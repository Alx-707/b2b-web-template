/**
 * 站点配置
 *
 * Template placeholders - replace with your project values:
 * - [PROJECT_NAME]: Your company/project name
 * - [BASE_URL]: Your site URL (e.g., https://example.com)
 * - [EMAIL]: Contact email address
 * - [PHONE]: Contact phone number
 * - [TWITTER_URL]: Twitter profile URL
 * - [LINKEDIN_URL]: LinkedIn company URL
 * - [GITHUB_URL]: GitHub organization/repo URL
 */

// 站点配置
export const SITE_CONFIG = {
  baseUrl:
    process.env['NEXT_PUBLIC_BASE_URL'] ||
    process.env['NEXT_PUBLIC_SITE_URL'] ||
    'https://example.com',
  name: '[PROJECT_NAME]',
  description: 'Modern B2B Enterprise Web Platform with Next.js 16',

  // SEO配置
  seo: {
    titleTemplate: '%s | [PROJECT_NAME]',
    defaultTitle: '[PROJECT_NAME]',
    defaultDescription: 'Modern B2B Enterprise Web Platform with Next.js 16',
    keywords: ['Next.js', 'React', 'TypeScript', 'B2B', 'Enterprise'],
  },

  // 社交媒体链接
  social: {
    twitter: '[TWITTER_URL]',
    linkedin: '[LINKEDIN_URL]',
    github: '[GITHUB_URL]',
  },

  // 联系信息
  contact: {
    phone: '[PHONE]',
    email: '[EMAIL]',
    whatsappNumber: process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '[PHONE]',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
