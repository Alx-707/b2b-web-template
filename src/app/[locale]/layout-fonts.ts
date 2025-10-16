import localFont from 'next/font/local';

/**
 * Geist Sans 字体配置
 * 用于主要文本内容
 */
export const geistSans = localFont({
  variable: '--font-geist-sans',
  src: [
    {
      path: '../../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
});

/**
 * Geist Mono 字体配置
 * 用于代码和等宽文本
 */
export const geistMono = localFont({
  variable: '--font-geist-mono',
  src: [
    {
      path: '../../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
});

/**
 * 中文字体采用系统字体栈与可选子集（见 head.tsx 注入的 @font-face）。
 * 不再依赖 Google Fonts，避免 CI/受限网络环境下载超时。
 */

/**
 * 获取字体类名字符串
 * 用于应用到body元素
 * P0.4 优化：支持环境变量控制中文字体启用/禁用
 */
export function getFontClassNames(): string {
  // 字体变量仅包含英文字体（Geist Sans/Mono）。中文字体通过 CSS 变量 --font-chinese-stack 控制
  // 与 head.tsx 注入的子集样式解耦，避免构建时的外部依赖。
  return `${geistSans.variable} ${geistMono.variable}`;
}
