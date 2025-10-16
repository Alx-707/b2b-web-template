import { describe, expect, it, vi } from 'vitest';
import {
  geistMono,
  geistSans,
  getFontClassNames,
} from '@/app/[locale]/layout-fonts';

// Mock Next.js字体函数 - 使用vi.hoisted确保正确初始化
// 使用 next/font/local 的通用 mock，具体字体对象结构在断言中验证

vi.mock('next/font/local', () => ({
  default: vi.fn((options: { variable?: string }) => ({
    variable: options.variable ?? '--font-local',
    className: 'local-font-class',
    style: { fontFamily: 'Local Font' },
  })),
}));

describe('Layout Fonts Configuration', () => {
  describe('geistSans字体配置', () => {
    it('应该正确配置Geist Sans字体', () => {
      expect(geistSans).toBeDefined();
      expect(geistSans.variable).toBe('--font-geist-sans');
    });

    it('应该包含正确的字体配置选项', () => {
      // 验证字体配置对象的结构
      expect(geistSans).toHaveProperty('variable');
      expect(geistSans).toHaveProperty('className');
      expect(geistSans).toHaveProperty('style');
    });

    it('应该设置正确的CSS变量名', () => {
      expect(geistSans.variable).toBe('--font-geist-sans');
    });
  });

  describe('geistMono字体配置', () => {
    it('应该正确配置Geist Mono字体', () => {
      expect(geistMono).toBeDefined();
      expect(geistMono.variable).toBe('--font-geist-mono');
    });

    it('应该包含正确的字体配置选项', () => {
      // 验证字体配置对象的结构
      expect(geistMono).toHaveProperty('variable');
      expect(geistMono).toHaveProperty('className');
      expect(geistMono).toHaveProperty('style');
    });

    it('应该设置正确的CSS变量名', () => {
      expect(geistMono.variable).toBe('--font-geist-mono');
    });
  });

  describe('getFontClassNames函数', () => {
    it('应该返回组合的字体类名字符串', () => {
      const classNames = getFontClassNames();

      expect(typeof classNames).toBe('string');
      expect(classNames).toContain('--font-geist-sans');
      expect(classNames).toContain('--font-geist-mono');
    });

    it('应该包含两个字体变量并用空格分隔', () => {
      const classNames = getFontClassNames();
      const parts = classNames.split(' ');

      expect(parts).toHaveLength(2);
      expect(parts[0]).toContain('--font-geist-sans');
      expect(parts[1]).toContain('--font-geist-mono');
    });

    // 中文字体子集由 head.tsx 注入，不再通过 next/font 变量控制

    it('应该返回一致的结果', () => {
      const classNames1 = getFontClassNames();
      const classNames2 = getFontClassNames();

      expect(classNames1).toBe(classNames2);
    });

    it('应该返回非空字符串', () => {
      const classNames = getFontClassNames();

      expect(classNames).toBeTruthy();
      expect(classNames.length).toBeGreaterThan(0);
    });
  });

  describe('字体变量一致性', () => {
    it('geistSans和geistMono应该有不同的变量名', () => {
      expect(geistSans.variable).not.toBe(geistMono.variable);
    });

    it('字体变量应该遵循CSS自定义属性命名规范', () => {
      expect(geistSans.variable).toMatch(/^--font-/);
      expect(geistMono.variable).toMatch(/^--font-/);
    });

    it('getFontClassNames应该包含所有定义的字体变量', () => {
      const classNames = getFontClassNames();

      expect(classNames).toContain(geistSans.variable);
      expect(classNames).toContain(geistMono.variable);
      // 中文字体变量不再出现在类名中
    });
  });

  describe('字体对象属性验证', () => {
    it('geistSans应该包含必要的Next.js字体属性', () => {
      // 验证Next.js字体对象的基本结构
      expect(geistSans).toHaveProperty('className');
      expect(geistSans).toHaveProperty('style');
      expect(typeof geistSans.className).toBe('string');
      expect(typeof geistSans.style).toBe('object');
    });

    it('geistMono应该包含必要的Next.js字体属性', () => {
      // 验证Next.js字体对象的基本结构
      expect(geistMono).toHaveProperty('className');
      expect(geistMono).toHaveProperty('style');
      expect(typeof geistMono.className).toBe('string');
      expect(typeof geistMono.style).toBe('object');
    });

    it('字体样式对象应该包含fontFamily属性', () => {
      expect(geistSans.style).toHaveProperty('fontFamily');
      expect(geistMono.style).toHaveProperty('fontFamily');
      expect(typeof geistSans.style.fontFamily).toBe('string');
      expect(typeof geistMono.style.fontFamily).toBe('string');
    });
  });

  describe('边界条件测试', () => {
    it('字体变量名不应该为空', () => {
      expect(geistSans.variable.length).toBeGreaterThan(0);
      expect(geistMono.variable.length).toBeGreaterThan(0);
    });

    it('字体类名不应该为空', () => {
      expect(geistSans.className.length).toBeGreaterThan(0);
      expect(geistMono.className.length).toBeGreaterThan(0);
    });

    it('getFontClassNames返回值不应该包含多余的空格', () => {
      const classNames = getFontClassNames();

      // 不应该以空格开头或结尾
      expect(classNames).not.toMatch(/^\s/);
      expect(classNames).not.toMatch(/\s$/);

      // 不应该包含连续的空格
      expect(classNames).not.toMatch(/\s{2,}/);
    });
  });
});
