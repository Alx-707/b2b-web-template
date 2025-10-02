'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// 动态导入 Toaster，仅在客户端加载
const Toaster = dynamic(
  () => import('@/components/ui/toaster').then((mod) => mod.Toaster),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * Lazy Toaster Wrapper
 *
 * P1 优化：将 Toaster 改为懒加载，减少 vendors chunk 大小
 * - 使用 requestIdleCallback 延迟加载
 * - 不影响 LCP（Toast 仅在用户交互时使用）
 * - 预期收益：-6 ~ -10 kB (Brotli)
 */
export function LazyToaster() {
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

  return <Toaster />;
}
