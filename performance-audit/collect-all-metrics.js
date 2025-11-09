/**
 * 自动化性能审计脚本
 * 使用 Playwright 收集所有页面的性能指标
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://tucsenberg-web-frontier.vercel.app';

const PAGES = [
  // 英文版
  { locale: 'en', path: '', name: '首页 (Home)' },
  { locale: 'en', path: '/about', name: '关于我们 (About)' },
  { locale: 'en', path: '/contact', name: '联系表单 (Contact)' },
  { locale: 'en', path: '/products', name: '产品 (Products)' },
  { locale: 'en', path: '/blog', name: '博客 (Blog)' },
  { locale: 'en', path: '/pricing', name: '定价 (Pricing)' },
  { locale: 'en', path: '/support', name: '支持 (Support)' },
  { locale: 'en', path: '/privacy', name: '隐私政策 (Privacy)' },
  { locale: 'en', path: '/terms', name: '服务条款 (Terms)' },

  // 中文版
  { locale: 'zh', path: '', name: '首页 (Home)' },
  { locale: 'zh', path: '/about', name: '关于我们 (About)' },
  { locale: 'zh', path: '/contact', name: '联系表单 (Contact)' },
  { locale: 'zh', path: '/products', name: '产品 (Products)' },
  { locale: 'zh', path: '/blog', name: '博客 (Blog)' },
  { locale: 'zh', path: '/pricing', name: '定价 (Pricing)' },
  { locale: 'zh', path: '/support', name: '支持 (Support)' },
  { locale: 'zh', path: '/privacy', name: '隐私政策 (Privacy)' },
  { locale: 'zh', path: '/terms', name: '服务条款 (Terms)' },
];

// 性能指标收集函数
const collectMetrics = async (page) => {
  return await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    const layoutShifts = performance.getEntriesByType('layout-shift');

    const paint = {};
    paintEntries.forEach((entry) => {
      paint[entry.name] = Math.round(entry.startTime);
    });

    const cls = layoutShifts
      .filter((entry) => !entry.hadRecentInput)
      .reduce((sum, entry) => sum + entry.value, 0);

    return {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      metrics: {
        // Time to First Byte
        ttfb: Math.round(nav.responseStart - nav.requestStart),

        // First Contentful Paint
        fcp: paint['first-contentful-paint'] || 0,

        // DOM Content Loaded
        dcl: Math.round(nav.domContentLoadedEventEnd - nav.fetchStart),

        // Load Complete
        load: Math.round(nav.loadEventEnd - nav.fetchStart),

        // Cumulative Layout Shift
        cls: Math.round(cls * 1000) / 1000,

        // Transfer Size
        transferSize: nav.transferSize,
        decodedBodySize: nav.decodedBodySize,

        // Resource Count
        resourceCount: performance.getEntriesByType('resource').length,

        // DOM Interactive
        domInteractive: Math.round(nav.domInteractive - nav.fetchStart),
      },

      // Core Web Vitals 评分
      scores: {
        ttfb:
          nav.responseStart - nav.requestStart < 800
            ? 'Good'
            : nav.responseStart - nav.requestStart < 1800
              ? 'Needs Improvement'
              : 'Poor',
        fcp:
          (paint['first-contentful-paint'] || 0) < 1800
            ? 'Good'
            : (paint['first-contentful-paint'] || 0) < 3000
              ? 'Needs Improvement'
              : 'Poor',
        cls: cls < 0.1 ? 'Good' : cls < 0.25 ? 'Needs Improvement' : 'Poor',
      },
    };
  });
};

// 主函数
async function main() {
  console.log('🚀 开始性能审计...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const results = [];

  for (let i = 0; i < PAGES.length; i++) {
    const pageInfo = PAGES[i];
    const url = `${BASE_URL}/${pageInfo.locale}${pageInfo.path}`;

    console.log(`[${i + 1}/${PAGES.length}] 审计: ${pageInfo.name}`);
    console.log(`    URL: ${url}`);

    try {
      // 导航到页面
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // 等待页面稳定
      await page.waitForTimeout(2000);

      // 收集性能指标
      const metrics = await collectMetrics(page);

      results.push({
        ...pageInfo,
        ...metrics,
      });

      console.log(
        `    ✅ TTFB: ${metrics.metrics.ttfb}ms | FCP: ${metrics.metrics.fcp}ms | CLS: ${metrics.metrics.cls}`,
      );
      console.log(
        `    📊 评分: TTFB=${metrics.scores.ttfb} | FCP=${metrics.scores.fcp} | CLS=${metrics.scores.cls}\n`,
      );
    } catch (error) {
      console.error(`    ❌ 错误: ${error.message}\n`);
      results.push({
        ...pageInfo,
        error: error.message,
      });
    }
  }

  await browser.close();

  // 保存结果
  const outputDir = path.join(__dirname, 'results');
  await fs.mkdir(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, `audit-${Date.now()}.json`);
  await fs.writeFile(outputFile, JSON.stringify(results, null, 2));

  console.log(`\n✅ 审计完成！结果已保存到: ${outputFile}`);

  // 生成汇总报告
  generateSummary(results);
}

// 生成汇总报告
function generateSummary(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 性能审计汇总报告');
  console.log('='.repeat(80) + '\n');

  const validResults = results.filter((r) => !r.error);

  if (validResults.length === 0) {
    console.log('❌ 没有成功收集到性能数据');
    return;
  }

  // 计算平均值
  const avgMetrics = {
    ttfb: Math.round(
      validResults.reduce((sum, r) => sum + r.metrics.ttfb, 0) /
        validResults.length,
    ),
    fcp: Math.round(
      validResults.reduce((sum, r) => sum + r.metrics.fcp, 0) /
        validResults.length,
    ),
    dcl: Math.round(
      validResults.reduce((sum, r) => sum + r.metrics.dcl, 0) /
        validResults.length,
    ),
    load: Math.round(
      validResults.reduce((sum, r) => sum + r.metrics.load, 0) /
        validResults.length,
    ),
    cls:
      Math.round(
        (validResults.reduce((sum, r) => sum + r.metrics.cls, 0) /
          validResults.length) *
          1000,
      ) / 1000,
  };

  console.log('📈 平均性能指标:');
  console.log(`   TTFB (Time to First Byte): ${avgMetrics.ttfb}ms`);
  console.log(`   FCP (First Contentful Paint): ${avgMetrics.fcp}ms`);
  console.log(`   DCL (DOM Content Loaded): ${avgMetrics.dcl}ms`);
  console.log(`   Load (Page Load Complete): ${avgMetrics.load}ms`);
  console.log(`   CLS (Cumulative Layout Shift): ${avgMetrics.cls}\n`);

  // 性能最差的 3 个页面
  const sortedByLoad = [...validResults].sort(
    (a, b) => b.metrics.load - a.metrics.load,
  );
  console.log('⚠️  性能最差的 3 个页面 (按 Load 时间排序):');
  sortedByLoad.slice(0, 3).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.name} (${r.locale}${r.path})`);
    console.log(
      `      Load: ${r.metrics.load}ms | FCP: ${r.metrics.fcp}ms | TTFB: ${r.metrics.ttfb}ms`,
    );
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

// 运行
main().catch(console.error);
