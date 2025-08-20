/// <reference types="vitest" />
/// <reference types="@vitest/browser/providers/playwright" />
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * 浏览器测试专用配置
 * 用于需要真实浏览器环境的测试场景：
 * - 复杂DOM交互测试
 * - 视觉回归测试
 * - 性能监控测试
 * - 响应式布局测试
 */
export default defineConfig({
  test: {
    // 浏览器测试环境配置
    environment: 'happy-dom', // 轻量级DOM环境，比jsdom更快

    // 全局设置
    globals: true,

    // 设置文件
    setupFiles: ['./src/test/setup.ts'],

    // 浏览器测试文件匹配模式
    include: [
      'src/**/*.browser.test.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.browser.{js,jsx,ts,tsx}',
      'tests/browser/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],

    // 排除文件 - 简化配置
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'build',
      'coverage',
      '**/*.d.ts',
      '**/*.stories.{js,jsx,ts,tsx}',
      'tests/e2e/**/*',
      '**/setup.{js,jsx,ts,tsx}',
      '**/test-utils.{js,jsx,ts,tsx}',
    ],

    // 浏览器特定配置 - Vitest 3新格式
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true, // 无头模式，提高CI性能

      // 浏览器实例配置
      instances: [
        {
          browser: 'chromium',
          launch: {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
            ],
          },
        },
      ],

      // 视口配置
      viewport: {
        width: 1280,
        height: 720,
      },

      // 截图配置（用于视觉回归测试）
      screenshotFailures: false, // 默认关闭，按需开启
    },

    // 覆盖率配置 - 浏览器测试专用
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      reportsDirectory: './coverage/browser',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        '.next/',
        'dist/',
        'build/',
        'coverage/',
        '**/*.d.ts',
        '**/*.stories.{js,jsx,ts,tsx}',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/*.browser.test.{js,jsx,ts,tsx}',
        'src/test/**',
        'src/testing/**',
        'scripts/**',
        '**/__mocks__/**',
        '**/test-utils/**',
      ],
      // 浏览器测试覆盖率阈值（相对宽松）
      thresholds: {
        global: {
          branches: 40,
          functions: 50,
          lines: 50,
          statements: 50,
        },
      },
    },

    // 测试超时设置 - 浏览器测试需要更长时间
    testTimeout: 30000, // 30秒，浏览器操作需要更多时间
    hookTimeout: 10000, // 10秒hook超时

    // 并发设置 - 浏览器测试资源消耗大，减少并发
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 2, // 减少并发数，避免资源竞争
        minThreads: 1,
      },
    },

    // 报告器配置
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './reports/browser-test-results.json',
    },

    // 环境变量
    env: {
      NODE_ENV: 'test',
      BROWSER_TEST: 'true',
    },

    // 性能配置 - 浏览器环境不支持memoryUsage
    logHeapUsage: false,
    isolate: true,

    // 重试配置 - 浏览器测试可能不稳定
    retry: 2,

    // UI配置
    ui: false, // 浏览器测试通常在CI中运行，不需要UI
    open: false,
  },

  // 路径别名配置 - 与主配置保持一致
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // 定义全局变量
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.BROWSER_TEST': '"true"',
  },

  // JSX配置 - 浏览器环境不需要注入React
  // esbuild: {
  //   jsxInject: `import React from 'react'`,
  // },
});
