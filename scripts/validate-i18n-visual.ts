#!/usr/bin/env tsx
/**
 * 国际化内容可视化验证工具
 *
 * 功能：
 * 1. 使用 Playwright 访问 en/zh 页面
 * 2. 截图对比，检测混合内容
 * 3. 提取页面文本，分析语言一致性
 * 4. 生成可视化报告
 *
 * 使用方法：
 * pnpm tsx scripts/validate-i18n-visual.ts
 */
import fs from 'fs';
import path from 'path';
import { chromium, type Browser, type Page } from 'playwright';

interface ValidationResult {
  url: string;
  locale: string;
  issues: string[];
  screenshot: string;
  textSample: string;
}

const results: ValidationResult[] = [];

// 中文字符正则表达式
const CHINESE_REGEX = /[\u4e00-\u9fa5]/g;

// 英文单词正则表达式
const ENGLISH_WORD_REGEX = /\b[a-zA-Z]{3,}\b/g;

// 技术术语白名单
const TECH_TERMS = new Set([
  'React',
  'Next',
  'TypeScript',
  'JavaScript',
  'CSS',
  'HTML',
  'API',
  'JSON',
  'HTTP',
  'HTTPS',
  'URL',
  'SEO',
  'UI',
  'UX',
  'GitHub',
  'npm',
  'pnpm',
  'yarn',
  'ESLint',
  'Prettier',
  'Tailwind',
  'shadcn',
  'Radix',
  'Lucide',
  'Zod',
  'MDX',
  'Server',
  'Client',
  'Component',
  'Hook',
  'Props',
  'State',
  'Web',
  'Vitals',
  'Performance',
  'Monitoring',
  'Analytics',
]);

/**
 * 分析页面文本内容
 */
function analyzeText(text: string, expectedLocale: 'en' | 'zh'): string[] {
  const issues: string[] = [];

  const chineseMatches = text.match(CHINESE_REGEX);
  const englishMatches = text.match(ENGLISH_WORD_REGEX);

  // 过滤技术术语
  const realEnglishWords = englishMatches?.filter(
    (word) => !TECH_TERMS.has(word),
  );

  if (expectedLocale === 'en') {
    // 英文页面不应该有中文
    if (chineseMatches && chineseMatches.length > 5) {
      issues.push(
        `English page contains ${chineseMatches.length} Chinese characters: "${chineseMatches.slice(0, 10).join('')}..."`,
      );
    }
  } else {
    // 中文页面不应该有太多英文（排除技术术语）
    if (realEnglishWords && realEnglishWords.length > 50) {
      issues.push(
        `Chinese page contains ${realEnglishWords.length} English words (excluding tech terms)`,
      );
    }
  }

  return issues;
}

/**
 * 验证单个页面
 */
async function validatePage(options: {
  page: Page;
  url: string;
  locale: 'en' | 'zh';
  screenshotDir: string;
}): Promise<ValidationResult> {
  const { page, url, locale, screenshotDir } = options;

  console.log(`  📄 Checking ${url}...`);

  await page.goto(url, { waitUntil: 'networkidle' });

  // 等待页面完全加载
  await page.waitForTimeout(2000);

  // 截图
  const screenshotPath = path.join(
    screenshotDir,
    `${locale}-${url.split('/').pop() || 'home'}.png`,
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // 提取页面文本
  const bodyText = await page.textContent('body');
  const textSample = bodyText?.substring(0, 500) || '';

  // 分析文本
  const issues = analyzeText(bodyText || '', locale);

  return {
    url,
    locale,
    issues,
    screenshot: screenshotPath,
    textSample,
  };
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 Starting visual i18n validation...\n');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 创建截图目录
  const screenshotDir = path.join(process.cwd(), 'i18n-validation-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 启动浏览器
  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage();

  // 要验证的页面
  const pages = [
    '', // 首页
    'about', // 关于页面
    'contact', // 联系页面
    'products', // 产品页面
    'blog', // 博客页面
  ];

  try {
    // 验证英文页面
    console.log('📝 Validating English pages...');
    for (const pagePath of pages) {
      const url = `${baseUrl}/en/${pagePath}`;
      const result = await validatePage({
        page,
        url,
        locale: 'en',
        screenshotDir,
      });
      results.push(result);
    }

    // 验证中文页面
    console.log('\n📝 Validating Chinese pages...');
    for (const pagePath of pages) {
      const url = `${baseUrl}/zh/${pagePath}`;
      const result = await validatePage({
        page,
        url,
        locale: 'zh',
        screenshotDir,
      });
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  // 生成报告
  console.log('\n📊 Validation Results:\n');

  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

  if (totalIssues === 0) {
    console.log(
      '✅ No issues found! All pages have proper language separation.\n',
    );
    console.log(`📸 Screenshots saved to: ${screenshotDir}\n`);
    process.exit(0);
  }

  // 输出问题
  results.forEach((result) => {
    if (result.issues.length > 0) {
      console.log(`❌ ${result.url}`);
      result.issues.forEach((issue) => {
        console.log(`   ${issue}`);
      });
      console.log(`   Screenshot: ${result.screenshot}`);
      console.log(
        `   Text sample: ${result.textSample.substring(0, 100)}...\n`,
      );
    }
  });

  console.log(
    `\n📈 Summary: ${totalIssues} issues found across ${results.length} pages\n`,
  );
  console.log(`📸 Screenshots saved to: ${screenshotDir}\n`);

  process.exit(totalIssues > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
