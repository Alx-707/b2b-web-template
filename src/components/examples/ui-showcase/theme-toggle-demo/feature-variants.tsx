import { HorizontalThemeToggle } from '@/components/theme/horizontal-theme-toggle';

/**
 * 功能变体演示组件
 */
export function FeatureVariants() {
  return (
    <div>
      <h4 className='mb-3 font-semibold'>⚙️ 功能变体</h4>
      <div className='space-y-4'>
        <div>
          <span className='text-muted-foreground mb-2 block text-sm'>
            带标签版本
          </span>
          <HorizontalThemeToggle showLabels />
        </div>

        <div>
          <span className='text-muted-foreground mb-2 block text-sm'>
            禁用动画版本
          </span>
          <HorizontalThemeToggle disableAnimations />
        </div>
      </div>
    </div>
  );
}
