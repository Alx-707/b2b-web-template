'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThemeMenuItem } from '@/components/theme/theme-menu-item';
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeToggle } from '@/hooks/use-theme-toggle';

export function ThemeToggle() {
  const t = useTranslations('theme');
  const {
    theme,
    isOpen,
    setIsOpen,
    prefersReducedMotion,
    prefersHighContrast,
    supportsViewTransitions,
    handleThemeChange,
    handleKeyDown,
    ariaAttributes,
  } = useThemeToggle();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DropdownMenuTrigger asChild>
        <ThemeToggleButton
          ariaAttributes={ariaAttributes}
          prefersHighContrast={prefersHighContrast}
          prefersReducedMotion={prefersReducedMotion}
          onKeyDown={(e) => handleKeyDown(e, () => setIsOpen(!isOpen))}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className={` ${prefersHighContrast ? 'border-foreground border-2' : ''} ${prefersReducedMotion ? '' : 'animate-in fade-in-0 zoom-in-95'} `}
        role='menu'
        aria-label={t('selectTheme')}
      >
        <ThemeMenuItem
          theme='light'
          currentTheme={theme || 'system'}
          label={t('light')}
          ariaLabel={t('switchToLight')}
          icon={Sun}
          supportsViewTransitions={supportsViewTransitions}
          prefersReducedMotion={prefersReducedMotion}
          onClick={(e) => handleThemeChange('light', e)}
          onKeyDown={(e) => handleKeyDown(e, () => handleThemeChange('light'))}
        />
        <ThemeMenuItem
          theme='dark'
          currentTheme={theme || 'system'}
          label={t('dark')}
          ariaLabel={t('switchToDark')}
          icon={Moon}
          supportsViewTransitions={supportsViewTransitions}
          prefersReducedMotion={prefersReducedMotion}
          onClick={(e) => handleThemeChange('dark', e)}
          onKeyDown={(e) => handleKeyDown(e, () => handleThemeChange('dark'))}
        />
        <ThemeMenuItem
          theme='system'
          currentTheme={theme || 'system'}
          label={t('system')}
          ariaLabel={t('switchToSystem')}
          icon={Monitor}
          supportsViewTransitions={supportsViewTransitions}
          prefersReducedMotion={prefersReducedMotion}
          onClick={(e) => handleThemeChange('system', e)}
          onKeyDown={(e) => handleKeyDown(e, () => handleThemeChange('system'))}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
