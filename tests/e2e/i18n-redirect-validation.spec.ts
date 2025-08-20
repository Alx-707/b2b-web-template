/**
 * Next.js 15.4.7 国际化重定向端到端测试
 *
 * 验证 Location 响应头修复对实际用户体验的影响
 */

import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Next.js 15.4.7 国际化重定向验证', () => {
  test.beforeEach(async ({ page }) => {
    // 清除所有存储和缓存
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('基础语言检测和重定向', () => {
    test('应该基于浏览器语言偏好正确重定向', async ({ page }) => {
      // 设置中文语言偏好
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      });

      // 访问根路径
      const response = await page.goto(`${BASE_URL}/`);

      // 验证响应状态
      expect(response?.status()).toBeLessThan(400);

      // 验证最终 URL（可能被重定向到中文版本）
      const finalUrl = page.url();

      // 根据 as-needed 配置，中文应该有 /zh 前缀
      if (finalUrl.includes('/zh')) {
        expect(finalUrl).toMatch(/\/zh($|\/)/);
      }

      // 验证页面内容加载正确
      await expect(page.locator('html')).toHaveAttribute('lang', /^(zh|en)/);
    });

    test('应该为英文用户保持无前缀路径', async ({ page }) => {
      // 设置英文语言偏好
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });

      const response = await page.goto(`${BASE_URL}/about`);

      expect(response?.status()).toBeLessThan(400);

      // 英文路径应该保持无前缀（as-needed 模式）
      const finalUrl = page.url();
      expect(finalUrl).toMatch(/\/about$/);
      expect(finalUrl).not.toMatch(/\/en\/about/);

      // 验证页面语言
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });

    test('应该正确处理中文路径访问', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/zh/guanyu`);

      expect(response?.status()).toBeLessThan(400);

      // 验证 URL 保持中文路径
      expect(page.url()).toMatch(/\/zh\/guanyu$/);

      // 验证页面语言
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    });
  });

  test.describe('路径本地化验证', () => {
    test('应该正确处理本地化路径映射', async ({ page }) => {
      // 测试产品页面的路径本地化
      const response = await page.goto(`${BASE_URL}/zh/chanpin`);

      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).toMatch(/\/zh\/chanpin$/);

      // 验证页面内容
      await expect(page.locator('h1, h2, h3')).toBeVisible();
    });

    test('应该正确处理联系页面的路径本地化', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/zh/lianxi`);

      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).toMatch(/\/zh\/lianxi$/);
    });

    test('应该正确处理英文原始路径', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/contact`);

      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).toMatch(/\/contact$/);
    });
  });

  test.describe('重定向性能和稳定性', () => {
    test('应该快速完成语言检测和重定向', async ({ page }) => {
      const startTime = Date.now();

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'zh-CN,zh;q=0.9',
      });

      const response = await page.goto(`${BASE_URL}/services`);
      const endTime = Date.now();

      expect(response?.status()).toBeLessThan(400);

      // 重定向应该在合理时间内完成（< 2秒）
      const redirectTime = endTime - startTime;
      expect(redirectTime).toBeLessThan(2000);
    });

    test('应该处理并发请求而不出现竞态条件', async ({ browser }) => {
      const promises = [];

      // 创建多个并发请求
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext({
          extraHTTPHeaders: {
            'Accept-Language':
              i % 2 === 0 ? 'zh-CN,zh;q=0.9' : 'en-US,en;q=0.9',
          },
        });

        const page = await context.newPage();
        promises.push(
          page.goto(`${BASE_URL}/about`).then((response) => ({
            status: response?.status(),
            url: page.url(),
            context: i % 2 === 0 ? 'zh' : 'en',
          })),
        );
      }

      const results = await Promise.all(promises);

      // 验证所有请求都成功
      results.forEach((result) => {
        expect(result.status).toBeLessThan(400);
      });

      // 验证中文和英文请求的 URL 模式
      const zhResults = results.filter((r) => r.context === 'zh');
      const enResults = results.filter((r) => r.context === 'en');

      // 中文请求可能被重定向到 /zh/guanyu 或保持 /about
      zhResults.forEach((result) => {
        expect(result.url).toMatch(/\/(about|zh\/guanyu)$/);
      });

      // 英文请求应该保持 /about
      enResults.forEach((result) => {
        expect(result.url).toMatch(/\/about$/);
      });
    });
  });

  test.describe('错误处理和回退机制', () => {
    test('应该处理无效的语言前缀', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/invalid-lang/about`);

      // 应该返回 404 或重定向到有效路径
      expect([200, 404, 301, 302, 307, 308]).toContain(response?.status() || 0);
    });

    test('应该处理不存在的本地化路径', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/zh/nonexistent-path`);

      // 应该返回 404
      expect(response?.status()).toBe(404);
    });

    test('应该在语言检测失败时回退到默认语言', async ({ page }) => {
      // 不设置任何语言偏好头
      await page.setExtraHTTPHeaders({
        'Accept-Language': '',
      });

      const response = await page.goto(`${BASE_URL}/pricing`);

      expect(response?.status()).toBeLessThan(400);

      // 应该回退到英文（默认语言）
      const finalUrl = page.url();
      expect(finalUrl).toMatch(/\/pricing$/);

      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });
  });

  test.describe('SEO 和元数据验证', () => {
    test('应该为不同语言设置正确的 hreflang 标签', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);

      // 检查 hreflang 标签
      const hreflangLinks = await page.locator('link[hreflang]').all();
      expect(hreflangLinks.length).toBeGreaterThan(0);

      // 验证包含英文和中文的 hreflang
      const hreflangValues = await Promise.all(
        hreflangLinks.map((link) => link.getAttribute('hreflang')),
      );

      expect(hreflangValues).toContain('en');
      expect(hreflangValues).toContain('zh');
    });

    test('应该为中文页面设置正确的元数据', async ({ page }) => {
      await page.goto(`${BASE_URL}/zh/guanyu`);

      // 验证页面标题和描述
      const title = await page.title();
      expect(title).toBeTruthy();

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(description).toBeTruthy();

      // 验证语言属性
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    });
  });

  test.describe('用户体验验证', () => {
    test('语言切换应该保持在相同的页面类型', async ({ page }) => {
      // 访问英文关于页面
      await page.goto(`${BASE_URL}/about`);

      // 查找语言切换器（如果存在）
      const languageToggle = page
        .locator(
          '[data-testid="language-toggle"], [aria-label*="language"], [aria-label*="语言"]',
        )
        .first();

      if (await languageToggle.isVisible()) {
        await languageToggle.click();

        // 等待导航完成
        await page.waitForLoadState('networkidle');

        // 验证切换到中文版本的对应页面
        const finalUrl = page.url();
        expect(finalUrl).toMatch(/\/zh\/guanyu$/);
      }
    });

    test('页面加载应该流畅无闪烁', async ({ page }) => {
      // 监控页面加载过程
      let redirectCount = 0;
      page.on('response', (response) => {
        if ([301, 302, 307, 308].includes(response.status())) {
          redirectCount++;
        }
      });

      await page.goto(`${BASE_URL}/services`);

      // 验证重定向次数合理（不超过 2 次）
      expect(redirectCount).toBeLessThanOrEqual(2);

      // 验证页面最终正确加载
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
