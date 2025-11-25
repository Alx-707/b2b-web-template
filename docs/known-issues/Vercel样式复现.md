# Vercel 样式复现采集记录

> 本文档记录通过自动化浏览器从 https://vercel.com 采集到的 Header / 导航链接 / Footer 实际样式数据，并对比当前项目实现情况。

## 1. 采集环境信息

- 采集时间: 2025-11-24T14:46:17.064Z (UTC)
- 浏览器 User-Agent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/142.0.0.0 Safari/537.36`
- 视口尺寸: `800 x 513`
- 采集工具: `browser_eval_next-devtools` (Playwright + Headless Chrome)

---

## 2. Header 容器样式

### 2.1 Vercel 实测值

```css
/* document.querySelector('header') */
height: 64px;
padding-inline: 24px;
padding-block: 0px;
font-family: Geist, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
font-size: 16px;
font-weight: 400;
line-height: normal;
letter-spacing: normal;
color: rgb(23, 23, 23);
background-color: rgba(0, 0, 0, 0);
border: 0px none rgb(23, 23, 23);
border-radius: 0px;
border-width: 0px;
border-color: rgb(23, 23, 23);
box-shadow: none;
transition-property: all;
transition-duration: 0s;
transition-timing-function: ease;
```

### 2.2 项目当前实现 (src/components/layout/header.tsx)

```tsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <div className="relative flex h-16 items-center justify-between">
    {/* ... */}
  </div>
</div>
```

- 高度: `h-16` → 64px ✅
- 水平内边距: `sm:px-6` → 24px (≥ 640px) ✅
- 字体: 使用全局 Geist 变量，等价于实测 Geist 字体 ✅
- 文本颜色 / 背景色: 由全局 theme token (`bg-background`, `text-foreground`) 控制，方向与 Vercel 接近 🔶

---

## 3. 导航链接样式 (Header 中第一个链接)

> 由于首页第一个 `<a>` 为 Logo 链接，此处记录的是 Logo 链接的基础样式（同样继承 Header 上下文的字体与颜色）。

### 3.1 Vercel 实测值

```css
/* header 内的第一个 a[href] (logo 链接) */
height: 18px;
padding-inline: 0px;
padding-block: 0px;
font-family: Geist, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
font-size: 16px;
font-weight: 400;
line-height: normal;
letter-spacing: normal;
color: rgb(23, 23, 23);
background-color: rgba(0, 0, 0, 0);
border: 0px none rgb(23, 23, 23);
border-radius: 4px;
box-shadow: none;
transition-property: box-shadow;
transition-duration: 0.2s;
transition-timing-function: ease;
```

> 注: 主导航文字链接的详细颜色与 hover 行为会在 `docs/vercel-style-capture.md` 中补充，本文件主要记录本次自动采集到的基础排版与动画参数。

### 3.2 项目当前实现 (Trigger / Link)

```ts
// src/components/ui/navigation-menu.tsx
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-[30px] items-center justify-center rounded-full bg-transparent px-3 py-2 text-sm font-normal outline-none transition-colors duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
);

function NavigationMenuLink(/* ... */) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "inline-flex h-[30px] items-center rounded-full px-3 py-2 text-sm font-normal text-muted-foreground outline-none transition-colors duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-0",
        className,
      )}
      {...props}
    />
  );
}
```

```tsx
// src/components/layout/vercel-navigation.tsx (片段)
<NavigationMenuTrigger
  className={cn(
    "relative inline-flex items-center rounded-full px-3 py-2 text-sm font-normal tracking-[0.01em]",
    "text-muted-foreground hover:text-[rgb(23,23,23)] data-[state=open]:text-[rgb(23,23,23)]",
    "bg-transparent hover:bg-transparent data-[state=open]:bg-[rgb(235,235,235)]",
    "dark:hover:bg-foreground/10 dark:data-[state=open]:bg-foreground/12",
    "shadow-none",
    "transition-colors duration-150 ease-out",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-0",
  )}
>
  {t(item.translationKey)}
</NavigationMenuTrigger>
```

### 3.3 导航样式对比

| 属性 | Vercel 实测 | 项目当前实现 | 状态 |
| ---- | ----------- | ------------ | ---- |
| 字号 | 16px (Logo) / 14px(主导航) | `text-sm` → 14px | 🔶 (主导航已对齐 14px，Logo 仍按 16px)
| 字重 | 400 | 400 | ✅ |
| 高度 | 文本行高撑开，无固定高度 | 固定 `h-[30px]` pill | 🔶 (更按钮化的视觉)
| 圆角 | 4px (Logo) | `rounded-full` | 🔶 (风格更鲜明)
| 默认颜色 | `rgb(23,23,23)` / 约 `#666` | `text-muted-foreground` (~ #666) | ✅ |
| hover 颜色 | 深色接近 `rgb(23,23,23)` | `hover:text-[rgb(23,23,23)]` | ✅ |
| 动画属性 | `transition: box-shadow 0.2s ease` | `transition-colors duration-150 ease-out` | 🔶 (属性+timing 不同，后续按方案 A 调整)

---

## 4. Footer 容器样式

### 4.1 Vercel 实测值

```css
/* document.querySelector('footer') 或 [role="contentinfo"] */
height: 526px;
padding-inline: 32px;
padding-block: 0px 32px;
font-family: Geist, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
font-size: 14px;
font-weight: 400;
line-height: normal;
letter-spacing: normal;
color: rgb(23, 23, 23);
background-color: rgb(250, 250, 250);
border: 0px none rgb(23, 23, 23);
box-shadow: none;
transition-property: all;
transition-duration: 0s;
transition-timing-function: ease;
```

### 4.2 项目当前实现 (token)

```ts
// src/config/footer-style-tokens.ts
export const FOOTER_STYLE_TOKENS = {
  layout: {
    maxWidthPx: 1080,
    marginXClamp: 'clamp(24px, 12vw, 184px)',
    paddingX: { basePx: 16, mdPx: 24, lgPx: 32 },
    paddingY: { basePx: 48, mdPx: 56, lgPx: 64 },
  },
  typography: {
    title: { fontSizePx: 14, lineHeightPx: 20, fontWeight: 600 },
    link: { fontSizePx: 14, lineHeightPx: 20, fontWeight: 400 },
  },
  hover: {
    transition: 'transition-colors duration-100 ease-out',
  },
};
```

### 4.3 Footer 容器对比

| 属性 | Vercel 实测 | 项目当前实现 | 状态 |
| ---- | ----------- | ------------ | ---- |
| 基准字号 | 14px | 14px | ✅ |
| 正文字重 | 400 | 400 | ✅ |
| 背景色 | `rgb(250,250,250)` (#FAFAFA) | `bg-background` (light 主题接近浅灰) | 🔶 |
| padding-inline | 32px | `lg:px-8` → 32px | ✅ |
| padding-block | `0 32px` | token Y 方向 48/56/64 | 🔶 (更宽松的上下留白)
| 动画 | 无显式动画(0s) | 链接层有 `duration-100 ease-out` | ✅ (行为归属于链接)

---

## 5. Footer 分组标题样式 (如 "Products")

### 5.1 Vercel 实测值

```css
/* footer 内第一列标题 h2 */
height: 18px;
padding-inline: 0px;
padding-block: 0px;
font-size: 14px;
font-weight: 500;
line-height: normal;
letter-spacing: normal;
color: rgb(23, 23, 23);
background-color: rgba(0, 0, 0, 0);
box-shadow: none;
```

### 5.2 项目当前实现

```ts
// src/config/footer-style-tokens.ts
typography: {
  title: {
    fontSizePx: 14,
    lineHeightPx: 20,
    fontWeight: 600,
  },
}
```

### 5.3 Footer 标题对比

| 属性 | Vercel 实测 | 项目当前实现 | 状态 |
| ---- | ----------- | ------------ | ---- |
| 字号 | 14px | 14px | ✅ |
| 行高 | ~20px (单行) | 20px | ✅ |
| 字重 | 500 | 600 | 🔶 (略粗，将在保守方案中调整为 500) |
| 颜色 | `rgb(23,23,23)` | `text-foreground` (接近深色) | ✅ |

---

## 6. Footer 链接样式 (如 Products 列的 "AI")

### 6.1 Vercel 实测值

```css
/* Products 列第一个链接 */
font-size: 14px;
font-weight: 400;
line-height: 20px;
letter-spacing: normal;
color: rgb(102, 102, 102);
background-color: rgba(0, 0, 0, 0);
border-radius: 0px;
padding-inline: 0px;
padding-block: 0px;
box-shadow: none;
transition-property: color;
transition-duration: 0.1s;
transition-timing-function: ease;
```

### 6.2 项目当前实现 (Footer 链接 class)

```tsx
// src/components/footer/Footer.tsx 片段
const linkClassName = cn(
  'inline-flex items-center gap-2 px-0 py-0 focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  hover.transition, // 默认: transition-colors duration-100 ease-out
  colors.light.text,
  colors.dark.text,
  colors.light.hoverText,
  colors.dark.hoverText,
);
```

### 6.3 Footer 链接对比

| 属性 | Vercel 实测 | 项目当前实现 | 状态 |
| ---- | ----------- | ------------ | ---- |
| 字号 | 14px | 14px | ✅ |
| 行高 | 20px | 20px | ✅ |
| 字重 | 400 | 400 | ✅ |
| 默认颜色 | `rgb(102,102,102)` | `text-neutral-600` | ✅ (接近 #666) |
| hover 颜色 | 深色接近 `#171717` | `hover:text-neutral-900` | ✅ |
| 圆角 | 0 | 内联 `inline-flex`，无额外圆角 | ✅ |
| padding | 0 | `px-0 py-0` | ✅ |
| 动画 | `color 0.1s ease` | `transition-colors duration-100 ease-out` | 🔶 (timing function 略有差异，将调整为 `ease`) |

---

## 7. 总体对比汇总

### 7.1 Header & 导航

| 维度 | 属性 | Vercel 实测 | 项目当前 | 状态 |
| ---- | ---- | ----------- | -------- | ---- |
| Header 容器 | 高度 | 64px | 64px (`h-16`) | ✅ |
| Header 容器 | padding-inline | 24px | 24px (`sm:px-6`) | ✅ |
| Header 容器 | 字号 | 16px | 16px (全局) | ✅ |
| 导航链接 | 字号 | 14px(主导航) | 14px (`text-sm`) | ✅ |
| 导航链接 | 默认颜色 | 灰色 (`#666` 附近) | `text-muted-foreground` | ✅ |
| 导航链接 | hover 颜色 | 接近 `rgb(23,23,23)` | `hover:text-[rgb(23,23,23)]` | ✅ |
| 导航链接 | 高度 | 文本自然高度 | 固定 `h-[30px]` pill | 🔶 |
| 导航链接 | 圆角 | 0 / 少量 | `rounded-full` | 🔶 |
| 导航链接 | 动画 | `0.1–0.2s ease` | `duration-150 ease-out` | 🔶 (将调为 100ms + `ease`) |

### 7.2 Footer

| 维度 | 属性 | Vercel 实测 | 项目当前 | 状态 |
| ---- | ---- | ----------- | -------- | ---- |
| Footer 容器 | 背景 | `#FAFAFA` | `bg-background` | 🔶 |
| Footer 容器 | padding-inline | 32px | `lg:px-8` → 32px | ✅ |
| Footer 标题 | 字重 | 500 | 600 | 🔶 (将调为 500) |
| Footer 链接 | 字号/行高 | 14px / 20px | 14px / 20px | ✅ |
| Footer 链接 | 默认颜色 | `#666` | `text-neutral-600` | ✅ |
| Footer 链接 | hover 颜色 | 深色接近 `#171717` | `hover:text-neutral-900` | ✅ |
| Footer 链接 | 动画 | `0.1s ease` | `duration-100 ease-out` | 🔶 (将调为 `ease`) |

---

## 8. 后续调整计划摘要

1. **导航 (方案 A)**
   - 保留 `h-[30px]` + `rounded-full` pill 形态
   - 将 `duration-150` 调整为 `duration-100`
   - 将 `ease-out` 调整为 `ease`
   - 确保默认颜色接近 `rgb(102,102,102)`，hover 精确为 `rgb(23,23,23)`

2. **Footer (保守方案)**
   - 标题字重: `fontWeight: 600` → `fontWeight: 500`
   - hover 过渡: `transition-colors duration-100 ease-out` → `transition-colors duration-100 ease`

以上为本次基于自动化采集得到的 Vercel 样式基线，后续样式 / 测试调整将以此为对齐参考。
