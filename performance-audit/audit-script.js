/**
 * 性能审计脚本
 * 收集所有页面的 Web Vitals 和性能指标
 */

const pages = [
  // 英文版页面
  { locale: 'en', path: '', name: '首页' },
  { locale: 'en', path: '/about', name: '关于我们' },
  { locale: 'en', path: '/contact', name: '联系表单' },
  { locale: 'en', path: '/products', name: '产品' },
  { locale: 'en', path: '/blog', name: '博客' },
  { locale: 'en', path: '/pricing', name: '定价' },
  { locale: 'en', path: '/support', name: '支持' },
  { locale: 'en', path: '/privacy', name: '隐私政策' },
  { locale: 'en', path: '/terms', name: '服务条款' },

  // 中文版页面
  { locale: 'zh', path: '', name: '首页' },
  { locale: 'zh', path: '/about', name: '关于我们' },
  { locale: 'zh', path: '/contact', name: '联系表单' },
  { locale: 'zh', path: '/products', name: '产品' },
  { locale: 'zh', path: '/blog', name: '博客' },
  { locale: 'zh', path: '/pricing', name: '定价' },
  { locale: 'zh', path: '/support', name: '支持' },
  { locale: 'zh', path: '/privacy', name: '隐私政策' },
  { locale: 'zh', path: '/terms', name: '服务条款' },
];

const baseUrl = 'https://tucsenberg-web-frontier.vercel.app';

// 性能数据收集函数
const collectPerformanceData = async () => {
  const performanceData = {
    url: window.location.href,
    timestamp: new Date().toISOString(),

    // Navigation Timing
    navigation: performance.getEntriesByType('navigation')[0],

    // Resource Timing
    resources: {
      total: performance.getEntriesByType('resource').length,
      byType: {},
    },

    // Paint Timing
    paint: {},

    // Layout Shifts
    cls: 0,
  };

  // 分类资源
  const resources = performance.getEntriesByType('resource');
  resources.forEach((resource) => {
    const type = resource.initiatorType || 'other';
    performanceData.resources.byType[type] =
      (performanceData.resources.byType[type] || 0) + 1;
  });

  // Paint Timing
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach((entry) => {
    performanceData.paint[entry.name] = entry.startTime;
  });

  // CLS (Cumulative Layout Shift)
  const layoutShifts = performance.getEntriesByType('layout-shift');
  performanceData.cls = layoutShifts
    .filter((entry) => !entry.hadRecentInput)
    .reduce((sum, entry) => sum + entry.value, 0);

  // 计算关键指标
  const nav = performanceData.navigation;
  performanceData.metrics = {
    // Time to First Byte
    ttfb: nav.responseStart - nav.requestStart,

    // DOM Content Loaded
    dcl: nav.domContentLoadedEventEnd - nav.fetchStart,

    // Load Complete
    load: nav.loadEventEnd - nav.fetchStart,

    // DOM Interactive
    domInteractive: nav.domInteractive - nav.fetchStart,

    // First Contentful Paint
    fcp: performanceData.paint['first-contentful-paint'] || 0,

    // Cumulative Layout Shift
    cls: performanceData.cls,

    // Transfer Size
    transferSize: nav.transferSize,
    decodedBodySize: nav.decodedBodySize,
  };

  return performanceData;
};

module.exports = { pages, baseUrl, collectPerformanceData };
