import { Geist, Geist_Mono, Noto_Sans_SC } from 'next/font/google';

/**
 * Geist Sans 字体配置
 * 用于主要文本内容
 */
export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

/**
 * Geist Mono 字体配置
 * 用于代码和等宽文本
 */
export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

/**
 * Noto Sans SC 字体配置
 * 用于中文内容优化
 * P0.4 优化：添加中文字体支持，改善中文页面 LCP（目标 -200ms）
 */
export const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  subsets: ['latin'], // 基础子集，避免加载完整中文字体
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  fallback: ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei'],
});

/**
 * 获取字体类名字符串
 * 用于应用到body元素
 * P0.4 优化：支持环境变量控制中文字体启用/禁用
 */
export function getFontClassNames(): string {
  const enableCnFont = process.env.NEXT_PUBLIC_ENABLE_CN_FONT_SUBSET === 'true';

  return enableCnFont
    ? `${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable}`
    : `${geistSans.variable} ${geistMono.variable}`;
}
