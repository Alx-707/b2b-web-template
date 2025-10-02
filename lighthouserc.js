// 关键URL优先策略：CI_DAILY=true时运行全部URL，否则仅运行关键3个URL
// 这将CI耗时从15分钟优化至5-8分钟
const isDaily = process.env.CI_DAILY === 'true';

const criticalUrls = [
  'http://localhost:3000',
  'http://localhost:3000/en',
  'http://localhost:3000/zh',
];

const allUrls = [
  ...criticalUrls,
  // Localized routes – the app uses /[locale]/... paths
  'http://localhost:3000/en/about',
  'http://localhost:3000/zh/about',
  'http://localhost:3000/en/contact',
  'http://localhost:3000/zh/contact',
  'http://localhost:3000/en/products',
  'http://localhost:3000/zh/products',
];

module.exports = {
  ci: {
    collect: {
      url: isDaily ? allUrls : criticalUrls,
      startServerCommand: 'pnpm start',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        // 调整LCP阈值为3000ms，对齐GPT-5性能目标（LCP≤3.0s）
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        // 调整CLS阈值为0，对齐GPT-5性能目标（CLS=0）
        'cumulative-layout-shift': ['error', { maxNumericValue: 0 }],
        // 调整TBT阈值为200ms，对齐GPT-5性能目标（TBT≤200ms）
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        // 'first-meaningful-paint' 已废弃，Lighthouse 不再产出该数值，移除以避免 NaN 断言
        'interactive': ['error', { maxNumericValue: 3000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
