'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { COUNT_1600 } from '@/constants';

// 动态导入 NextTopLoader，仅在客户端加载
const NextTopLoader = dynamic(() => import('nextjs-toploader'), {
  ssr: false,
  loading: () => null,
});

interface LazyTopLoaderProps {
  nonce?: string | undefined;
}

/**
 * Lazy Top Loader Wrapper
 *
 * P1 优化：将 NextTopLoader 改为懒加载，减少 vendors chunk 大小
 * - 使用 requestIdleCallback 延迟加载
 * - 不影响 LCP（进度条仅在页面切换时使用）
 * - 预期收益：-4 ~ -8 kB (Brotli)
 */
export function LazyTopLoader({ nonce }: LazyTopLoaderProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // 使用 requestIdleCallback 在浏览器空闲时加载
    if ('requestIdleCallback' in window) {
      const idleCallbackId = window.requestIdleCallback(
        () => {
          setShouldRender(true);
        },
        { timeout: 2000 }, // 2秒超时，确保一定会加载
      );

      return () => {
        window.cancelIdleCallback(idleCallbackId);
      };
    }

    // Fallback：浏览器不支持 requestIdleCallback
    const timeoutId = setTimeout(() => {
      setShouldRender(true);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <NextTopLoader
      color='var(--primary)'
      height={2}
      showSpinner={false}
      easing='ease-in-out'
      speed={200}
      shadow='0 0 15px var(--primary),0 0 8px var(--primary)'
      zIndex={COUNT_1600}
      {...(nonce && { nonce })}
    />
  );
}
