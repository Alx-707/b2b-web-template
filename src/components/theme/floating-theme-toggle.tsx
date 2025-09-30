'use client';

import { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

/**
 * 主题选项配置
 */
const THEME_OPTIONS = [
  {
    value: 'system',
    icon: Monitor,
    labelKey: 'theme.system',
    ariaLabelKey: 'theme.switchToSystem',
  },
  {
    value: 'light',
    icon: Sun,
    labelKey: 'theme.light',
    ariaLabelKey: 'theme.switchToLight',
  },
  {
    value: 'dark',
    icon: Moon,
    labelKey: 'theme.dark',
    ariaLabelKey: 'theme.switchToDark',
  },
] as const;

/**
 * 组件属性接口
 */
export interface FloatingThemeToggleProps {
  /** 自定义样式类名 */
  'className'?: string;
  /** 自定义测试ID */
  'data-testid'?: string;
}

/**
 * 右下角悬浮的 Vercel 风格主题切换组件
 *
 * 特点：
 * - 固定在右下角位置
 * - 三个并排按钮（System、Light、Dark）
 * - 与 Vercel 官网设置页面样式一致
 * - 完整的无障碍支持
 * - 国际化支持
 */
export function FloatingThemeToggle({
  className,
  'data-testid': testId = 'floating-theme-toggle',
}: FloatingThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const t = useTranslations();
  // 使用 useState 初始化函数，在客户端直接返回 true，避免 effect
  const [mounted] = useState(() => typeof window !== 'undefined');

  const activeTheme = resolvedTheme ?? theme;

  // 加载状态的骨架屏 - 在服务器端和客户端水合前显示
  if (!mounted) {
    return (
      <div
        className={cn(
          'fixed right-6 bottom-6 z-50',
          'bg-background/80 rounded-lg border shadow-lg backdrop-blur-sm',
          'p-3',
          className,
        )}
        data-testid={`${testId}-skeleton`}
      >
        <div className='flex gap-1'>
          {THEME_OPTIONS.map((_, index) => (
            <div
              key={index}
              className='flex animate-pulse items-center gap-1 rounded-md border p-2'
            >
              <div className='bg-muted h-4 w-4 rounded' />
              <div className='bg-muted h-3 w-8 rounded' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed right-6 bottom-6 z-50',
        'bg-background/95 rounded-lg border shadow-lg backdrop-blur-sm',
        'p-3',
        className,
      )}
      data-testid={testId}
    >
      <div
        className='flex gap-1'
        role='radiogroup'
        aria-label={t('theme.selectTheme')}
      >
        {THEME_OPTIONS.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = activeTheme === themeOption.value;
          const label = t(themeOption.labelKey);
          const ariaLabel = t(themeOption.ariaLabelKey);

          return (
            <button
              key={themeOption.value}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                'hover:bg-muted focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                'border border-transparent',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
              onClick={() => setTheme(themeOption.value)}
              aria-label={ariaLabel}
              role='radio'
              aria-checked={isActive}
              type='button'
              data-testid={`${testId}-${themeOption.value}`}
            >
              <Icon className='h-3.5 w-3.5' />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
