/**
 * Header Component
 *
 * Main navigation header with responsive design, logo, navigation menus,
 * and utility controls (language switcher, theme toggle).
 */
'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/layout/logo';
import { useScrollShadow } from '@/hooks/use-scroll-shadow';

const MobileNavigation = dynamic(
  () =>
    import('@/components/layout/mobile-navigation').then(
      (m) => m.MobileNavigation,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className='h-9 w-9 rounded-md md:hidden'
        aria-hidden='true'
      />
    ),
  },
);

const NavSwitcher = dynamic(() =>
  import('@/components/layout/nav-switcher').then((m) => m.NavSwitcher),
);

const LanguageToggle = dynamic(
  () => import('@/components/language-toggle').then((m) => m.LanguageToggle),
  {
    ssr: false,
    loading: () => (
      <div
        className='h-9 w-20 rounded-md'
        aria-hidden='true'
      />
    ),
  },
);

/**
 * Header Component
 *
 * Main navigation header with responsive design, logo, navigation menus,
 * and utility controls (language switcher, theme toggle).
 */

// Simplified header props interface
interface HeaderProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'transparent';
  sticky?: boolean;
}

export function Header({
  className,
  variant = 'default',
  sticky = true,
}: HeaderProps) {
  // Simplified logic: transparent headers are never sticky
  const isSticky = variant === 'transparent' ? false : sticky;
  const isMinimal = variant === 'minimal';
  const isTransparent = variant === 'transparent';

  // Vercel-style scroll shadow effect
  const scrolled = useScrollShadow();

  // Check if using Vercel navigation variant
  const isVercelNav = process.env.NEXT_PUBLIC_NAV_VARIANT !== 'legacy';

  return (
    <header
      className={cn(
        // Vercel-style: solid background, no blur effect
        'bg-background w-full',
        isSticky && 'sticky top-0 z-50',
        isTransparent && 'border-transparent bg-transparent',
        // Vercel-style scroll border: 隐藏 → 滚动时显示灰色细线
        isVercelNav
          ? scrolled
            ? 'border-b border-gray-200 transition-all duration-200 dark:border-gray-800'
            : 'border-b border-transparent transition-all duration-200'
          : !isTransparent && 'border-border border-b',
        className,
      )}
    >
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='relative flex h-16 items-center justify-between'>
          {/* Left section: Logo + Mobile Menu */}
          <div className='flex items-center gap-4'>
            <MobileNavigation />
            <Logo />
          </div>

          {/* Center section: Main Navigation (Desktop) - Absolutely centered */}
          {!isMinimal && (
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
              <NavSwitcher />
            </div>
          )}

          {/* Right section: Utility Controls */}
          <div className='flex items-center gap-2'>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

// Simplified convenience components (only keep the most commonly used ones)
export function HeaderMinimal({ className }: { className?: string }) {
  return (
    <Header
      variant='minimal'
      {...(className && { className })}
    />
  );
}

export function HeaderTransparent({ className }: { className?: string }) {
  return (
    <Header
      variant='transparent'
      {...(className && { className })}
    />
  );
}
