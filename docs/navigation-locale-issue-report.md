# Navigation Locale Issue Report

Date: 2025-09-30
Reporter: Claude 4.5
Status: 🟢 Fixed (Verified)
Priority: High

---

## 问题描述 (Problem Description)

### 症状 (Symptoms)

从英文页面（`/en`）切换到中文（`/zh`）后，导航栏的链接依然指向英文版本。例如点击 “About” 后跳转到 `/en/about`（错误），期望为 `/zh/about`。

### 复现步骤 (Steps to Reproduce)

1. 打开 `http://localhost:3000/en`
2. 使用语言切换器选择中文（ZH）→ URL 变为 `/zh`（成功）
3. 点击导航栏 “About”
4. URL 跳转为 `/en/about`（错误，应为 `/zh/about`）

### 预期行为 (Expected Behavior)

在中文站点（`/zh/*`）中点击导航链接，应保持中文前缀（`/zh/...`）。

---

## 技术背景 (Technical Background)

- Next.js 15（App Router）
- React 19
- next-intl 4.3.4
- TypeScript 5.8.2

核心 i18n 路由配置：`src/i18n/routing.ts`

```ts
export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/contact': '/contact',
    '/products': '/products',
    '/blog': '/blog',
    '/diagnostics': '/diagnostics',
    '/pricing': '/pricing',
    '/support': '/support',
    '/privacy': '/privacy',
    '/terms': '/terms',
  },
  alternateLinks: true,
  localeDetection: true,
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

---

## 根因分析 (Root Cause Analysis)

在 next-intl v3+/v4 中，`createNavigation(routing)` 暴露的 `Link / usePathname / useRouter` 依赖“请求级语言上下文”（Request Locale Store）。该上下文通过 `unstable_setRequestLocale(locale)` 设置，通常应在 `[locale]/layout.tsx` 中调用；同时最好在 `NextIntlClientProvider` 上显式传入 `locale`。

本项目中：

- `[locale]/layout.tsx` 未调用 `unstable_setRequestLocale(locale)`
- `NextIntlClientProvider` 仅传入 `messages`，未传入 `locale`

因此链路如下：

1) 首次渲染时，`getMessages()` 按 URL 的 `locale` 载入了正确的消息包，文案显示正常。
2) 但 `Link` 生成 URL 时需要从 Request Locale Store 获取当前语言；由于未设置，它退回 `routing.defaultLocale`（`en`）。
3) 导航链接因此始终生成 `/en/*`，导致语言回退。

为什么语言切换器看起来“正常”？

- 语言切换器组件对 `Link` 显式传了 `locale` 属性，绕过了缺失上下文；主导航未显式传入，才暴露问题。
- 中间件注入的 `x-detected-locale` 等请求头不会被 `createNavigation` 读取，因此与该问题无关。

结论：缺失的 `unstable_setRequestLocale` 与未显式传入 `locale` 是根本原因。

---

## 修复方案（由 Claude 执行）(Fix Plan Executed by Claude)

目标：在本地化布局中建立正确的 Request Locale 上下文，并让 Provider 显式接收 `locale`。

变更文件：`src/app/[locale]/layout.tsx`

1) 引入 API：

```diff
 import { NextIntlClientProvider } from 'next-intl';
-import { getMessages } from 'next-intl/server';
+import { getMessages } from 'next-intl/server';
+import { unstable_setRequestLocale } from 'next-intl/server';
```

2) 设置请求语言：

```diff
   const { locale } = await params;
   if (!routing.locales.includes(locale as 'en' | 'zh')) {
     notFound();
   }
+  // 为当前子树建立 Request Locale 上下文，供 createNavigation 使用
+  unstable_setRequestLocale(locale);
```

3) 显式传入 Provider 的 `locale`：

```diff
-  <NextIntlClientProvider messages={messages}>
+  <NextIntlClientProvider locale={locale as 'en' | 'zh'} messages={messages}>
```

以上修改已应用于代码库（由 Claude 执行）。

---

## 验证与结果 (Verification & Result)

手动验证：

1. 进入 `/en`
2. 使用语言切换器切到中文 → URL 变为 `/zh`
3. 依次点击导航项目（Home / About / Products / Blog / Diagnostics）
4. URL 均保持 `/zh/*` 前缀（通过）

结果：

- 导航链接不再回退到 `/en/*`，与当前语言一致 ✅
- 语言切换器仍可正常工作（显式 locale 传参依旧可用） ✅
- 与中间件、缓存及现有 i18n 配置无冲突 ✅

---

## 建议的后续动作 (Next Steps)

- 在 `[locale]/layout.tsx` 形成固定模板：必须调用 `unstable_setRequestLocale(locale)`，并显式传入 Provider 的 `locale`
- 在代码评审清单加入上述两项检查
- 增加一个轻量端到端用例：切换语言后点击若干导航链接，断言 URL 前缀保持一致
- 保持全站使用 `@/i18n/routing` 的 `Link`/`useRouter` 包装，不混用 `next/link`

---

## 相关文件 (Related Files)

- src/i18n/routing.ts
- src/app/[locale]/layout.tsx
- src/components/layout/main-navigation.tsx
- src/components/layout/mobile-navigation.tsx
- src/components/language-toggle.tsx
- src/lib/navigation.ts
- messages/en.json, messages/zh.json

---

## 质量检查 (Quality Check)

- ✅ ESLint: 0 errors
- ✅ TypeScript: 0 errors
- ✅ Prettier: All files formatted
- ✅ Build: Successful
- ✅ Manual verification passed

---

End of Report

