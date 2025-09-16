import { HorizontalThemeToggle } from '@/components/theme/horizontal-theme-toggle';

/**
 * 动画变体对比演示组件
 */
export function AnimationVariants() {
  return (
    <div className='rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-950/20 dark:to-purple-950/20'>
      <h4 className='mb-4 text-lg font-semibold'>🎭 动画变体对比</h4>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
              Circle Blur 动画
            </span>
            <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              View Transition API
            </span>
          </div>
          <HorizontalThemeToggle animationVariant='circle-blur' />
          <p className='text-muted-foreground text-xs'>
            基于点击位置的圆形展开动画，配合模糊效果过渡
          </p>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-purple-600 dark:text-purple-400'>
              Framer Motion 动画
            </span>
            <span className='rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
              默认
            </span>
          </div>
          <HorizontalThemeToggle animationVariant='framer-motion' />
          <p className='text-muted-foreground text-xs'>
            流畅的背景滑动动画，兼容性更好
          </p>
        </div>
      </div>
    </div>
  );
}
