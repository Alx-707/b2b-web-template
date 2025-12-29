/**
 * Footer Data & Style Baseline
 *
 * Provides reusable data structures and design tokens for the Footer component.
 * Template version: Simplified three-column structure (Navigation, Support, Social).
 */
import {
  FOOTER_STYLE_TOKENS,
  WHATSAPP_STYLE_TOKENS,
} from '@/config/footer-style-tokens';

export { FOOTER_STYLE_TOKENS, WHATSAPP_STYLE_TOKENS };

export interface FooterLinkItem {
  key: string;
  label: string;
  href: string;
  external?: boolean;
  showExternalIcon?: boolean;
  translationKey: string;
}

export interface FooterColumnConfig {
  key: string;
  title: string;
  translationKey: string;
  links: FooterLinkItem[];
}

export interface FooterLayoutTokens {
  maxWidthPx: number;
  marginXClamp: string;
  paddingX: {
    basePx: number;
    mdPx: number;
    lgPx: number;
  };
  paddingY: {
    basePx: number;
    mdPx: number;
    lgPx: number;
  };
  gapPx: {
    column: number;
    row: number;
  };
  minColumnWidthPx: number;
}

export interface FooterTypographyTokens {
  title: {
    fontSizePx: number;
    lineHeightPx: number;
    fontWeight: number;
    letterSpacing?: string;
  };
  link: {
    fontSizePx: number;
    lineHeightPx: number;
    fontWeight: number;
  };
  fontFamily: string;
}

export interface FooterColorTokens {
  light: {
    text: string;
    hoverText: string;
  };
  dark: {
    text: string;
    hoverText: string;
  };
  selection: {
    light: { background: string; foreground: string };
    dark: { background: string; foreground: string };
  };
}

export interface FooterHoverTokens {
  description: string;
  transition: string;
  light: {
    text: string;
    underline: boolean;
  };
  dark: {
    text: string;
    underline: boolean;
  };
}

export interface FooterStyleTokens {
  layout: FooterLayoutTokens;
  typography: FooterTypographyTokens;
  colors: FooterColorTokens;
  hover: FooterHoverTokens;
}

interface ThemedSurfaceTokens {
  background: string;
  foreground: string;
  border: string;
  hoverBackground: string;
  hoverBorder: string;
  hoverForeground: string;
  shadow: string;
}

export interface WhatsAppStyleTokens {
  sizePx: number;
  iconSizePx: number;
  borderRadiusPx: number;
  borderWidthPx: number;
  transition: string;
  focusRing: string;
  tooltip: {
    background: string;
    text: string;
  };
  pulse: {
    background: string;
    overlay: string;
  };
  light: ThemedSurfaceTokens;
  dark: ThemedSurfaceTokens;
}

export const FOOTER_COLUMNS: FooterColumnConfig[] = [
  {
    key: 'navigation',
    title: 'Navigation',
    translationKey: 'footer.sections.navigation.title',
    links: [
      {
        key: 'home',
        label: 'Home',
        href: '/',
        external: false,
        translationKey: 'footer.sections.navigation.home',
      },
      {
        key: 'about',
        label: 'About',
        href: '/about',
        external: false,
        translationKey: 'footer.sections.navigation.about',
      },
      {
        key: 'products',
        label: 'Products',
        href: '/products',
        external: false,
        translationKey: 'footer.sections.navigation.products',
      },
      {
        key: 'blog',
        label: 'Blog',
        href: '/blog',
        external: false,
        translationKey: 'footer.sections.navigation.blog',
      },
      {
        key: 'contact',
        label: 'Contact',
        href: '/contact',
        external: false,
        translationKey: 'footer.sections.navigation.contact',
      },
    ],
  },
  {
    key: 'support',
    title: 'Support',
    translationKey: 'footer.sections.support.title',
    links: [
      {
        key: 'faq',
        label: 'FAQs',
        href: '/faq',
        external: false,
        translationKey: 'footer.sections.support.faq',
      },
      {
        key: 'privacy',
        label: 'Privacy Policy',
        href: '/privacy',
        external: false,
        translationKey: 'footer.sections.support.privacy',
      },
      {
        key: 'terms',
        label: 'Terms of Service',
        href: '/terms',
        external: false,
        translationKey: 'footer.sections.support.terms',
      },
    ],
  },
  {
    key: 'social',
    title: 'Social',
    translationKey: 'footer.sections.social.title',
    links: [
      {
        key: 'github',
        label: 'GitHub',
        href: '[GITHUB_URL]',
        external: true,
        showExternalIcon: true,
        translationKey: 'footer.sections.social.github',
      },
      {
        key: 'twitter',
        label: 'Twitter',
        href: '[TWITTER_URL]',
        external: true,
        showExternalIcon: true,
        translationKey: 'footer.sections.social.twitter',
      },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        href: '[LINKEDIN_URL]',
        external: true,
        showExternalIcon: true,
        translationKey: 'footer.sections.social.linkedin',
      },
    ],
  },
];

export type FooterTokens = typeof FOOTER_STYLE_TOKENS;
