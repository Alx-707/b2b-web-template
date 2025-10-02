# P0.1 优化分析：NavSwitcher 动态导入方案

**创建时间**: 2025-01-XX
**任务**: P2.2.5 - Vendors Tree-shaking 优化 > P0.1 Header 拆分
**目标**: 减少 vendors chunk 大小，优化 @floating-ui 依赖

---

## 1. 问题诊断

### 1.1 Bundle Analyzer 数据

| 库名 | 大小（Parsed） | 大小（Gzip） | 占比 | 说明 |
|------|---------------|-------------|------|------|
| **use-intl (next-intl)** | **46.6 kB** | **13.7 kB** | **7.9%** | 最大依赖 |
| **@floating-ui/dom** | 18.7 kB | 7.3 kB | 3.2% | Radix UI 弹层依赖 |
| **@radix-ui/react-dialog** | 10.1 kB | 3.8 kB | 1.7% | Dialog 组件 |
| **@floating-ui/react-dom** | 3.1 kB | 1.4 kB | 0.5% | React 绑定 |

**总计**：Vendors chunk 589 kB（Parsed），174 kB（Gzip）

### 1.2 代码结构分析

#### Header 组件（src/components/layout/header.tsx）
```typescript
// Line 30-32: NavSwitcher 已经是动态导入 ✅
const NavSwitcher = dynamic(() =>
  import('@/components/layout/nav-switcher').then((m) => m.NavSwitcher),
);
```

#### NavSwitcher 组件（src/components/layout/nav-switcher.tsx）
```typescript
// Line 14-15: 内部导航组件是静态导入 ❌
import { MainNavigation } from './main-navigation';
import { VercelNavigation } from './vercel-navigation';

// Line 23-33: 默认使用 VercelNavigation
function getNavVariant(): 'vercel' | 'legacy' {
  const envVariant = process.env.NEXT_PUBLIC_NAV_VARIANT;
  if (envVariant === 'legacy') {
    return 'legacy';
  }
  return 'vercel'; // 默认值
}
```

#### VercelNavigation 组件（src/components/layout/vercel-navigation.tsx）
```typescript
// Line 22-29: 使用 Radix UI NavigationMenu
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

// Line 179-182: DropdownContent 已经是动态导入 ✅
const DropdownContent = dynamic(
  () => import('./vercel-dropdown-content').then((m) => m.DropdownContent),
  { ssr: false },
);
```

#### NavigationMenu 组件（src/components/ui/navigation-menu.tsx）
```typescript
// Line 2: 导入 Radix UI NavigationMenu（内部使用 @floating-ui）
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
```

### 1.3 依赖链路分析

```
Header (client component)
  └─> NavSwitcher (dynamic import ✅)
       ├─> MainNavigation (static import ❌)
       │    └─> NavigationMenu (Radix UI)
       │         └─> @floating-ui/dom (18.7 kB)
       │
       └─> VercelNavigation (static import ❌)
            └─> NavigationMenu (Radix UI)
                 └─> @floating-ui/dom (18.7 kB)
```

**问题根源**：
- NavSwitcher 虽然是动态导入，但内部的 MainNavigation 和 VercelNavigation 是**静态导入**
- 两个导航组件都使用 Radix UI NavigationMenu
- NavigationMenu 依赖 @floating-ui/dom
- 结果：@floating-ui 在首屏就被加载到 vendors chunk

---

## 2. 优化方案

### 2.1 方案概述

**目标**：将 NavSwitcher 内部的导航组件改为动态导入

**修改文件**：`src/components/layout/nav-switcher.tsx`

**核心思路**：
1. 移除静态导入（lines 14-15）
2. 使用 `next/dynamic` 动态导入两个导航组件
3. 配置 `ssr: false` 和 loading skeleton
4. 保持现有功能和样式不变

### 2.2 实施步骤

#### Step 1: 创建 Loading Skeleton

```typescript
// 新增：导航栏加载骨架屏
function NavSkeleton() {
  return (
    <div className="hidden md:flex items-center space-x-1" aria-hidden="true">
      <div className="h-9 w-16 bg-muted rounded-xl animate-pulse" />
      <div className="h-9 w-20 bg-muted rounded-xl animate-pulse" />
      <div className="h-9 w-16 bg-muted rounded-xl animate-pulse" />
      <div className="h-9 w-16 bg-muted rounded-xl animate-pulse" />
    </div>
  );
}
```

#### Step 2: 动态导入导航组件

```typescript
import dynamic from 'next/dynamic';

// 替换静态导入
const MainNavigation = dynamic(
  () => import('./main-navigation').then((m) => m.MainNavigation),
  { 
    ssr: false,
    loading: () => <NavSkeleton />
  }
);

const VercelNavigation = dynamic(
  () => import('./vercel-navigation').then((m) => m.VercelNavigation),
  { 
    ssr: false,
    loading: () => <NavSkeleton />
  }
);
```

#### Step 3: 保持现有逻辑不变

```typescript
// NavSwitcher 组件逻辑保持不变
export function NavSwitcher({
  className,
  variant,
  maxItems,
}: NavSwitcherProps) {
  const navVariant = getNavVariant();

  if (navVariant === 'legacy') {
    // ... 现有逻辑
    return <MainNavigation {...mainNavProps} />;
  }

  // ... 现有逻辑
  return <VercelNavigation {...vercelNavProps} />;
}
```

### 2.3 完整修改代码

**文件**: `src/components/layout/nav-switcher.tsx`

**修改范围**: Lines 12-15（移除静态导入，添加动态导入）

**新增内容**:
- 导入 `next/dynamic`
- 创建 `NavSkeleton` 组件
- 动态导入 `MainNavigation` 和 `VercelNavigation`

---

## 3. 预期效果

### 3.1 Bundle 大小变化

| 指标 | 优化前 | 优化后 | 减少 |
|------|--------|--------|------|
| **Vendors chunk（Brotli）** | 174 kB | ~163 kB | **-11 kB** |
| **Vendors chunk（Parsed）** | 575 kB | ~546 kB | **-29 kB** |
| **@floating-ui/dom** | 18.7 kB | 延迟加载 | -18.7 kB |
| **NavigationMenu** | ~10 kB | 延迟加载 | -10 kB |

### 3.2 加载流程优化

**优化前**:
```
首屏加载
  └─> vendors chunk (174 kB)
       ├─> @floating-ui/dom (18.7 kB)
       ├─> NavigationMenu (~10 kB)
       └─> 其他依赖
```

**优化后**:
```
首屏加载
  └─> vendors chunk (163 kB)
       └─> 其他依赖（不含 @floating-ui）

用户交互后（~100-200ms）
  └─> 导航组件 chunk
       ├─> @floating-ui/dom (18.7 kB)
       └─> NavigationMenu (~10 kB)
```

### 3.3 用户体验影响

| 指标 | 影响 | 说明 |
|------|------|------|
| **首屏加载** | ✅ 改善 | vendors chunk 减少 11 kB（Brotli） |
| **LCP** | ✅ 无影响 | 导航栏不是 LCP 元素 |
| **导航交互** | ⚠️ 轻微延迟 | ~100-200ms loading 状态 |
| **SEO** | ✅ 无影响 | 导航链接在 HTML 中 |
| **可访问性** | ✅ 无影响 | loading skeleton 有 aria-hidden |

---

## 4. 风险评估

### 4.1 低风险 ✅

- ✅ 不破坏现有功能
- ✅ 不影响样式
- ✅ 不影响国际化
- ✅ 不影响测试
- ✅ 不影响 SEO
- ✅ 不影响可访问性

### 4.2 需要注意 ⚠️

- ⚠️ 导航栏会有短暂的 loading 状态（~100-200ms）
- ⚠️ 需要验证 loading skeleton 样式与主题一致
- ⚠️ 需要验证两个导航组件的动态导入都正常工作
- ⚠️ 需要验证 Products 下拉菜单功能正常

### 4.3 回滚策略

```bash
# 方案 1: Git revert
git revert <commit-hash>

# 方案 2: 手动回滚
# 恢复 nav-switcher.tsx 的静态导入
import { MainNavigation } from './main-navigation';
import { VercelNavigation } from './vercel-navigation';
```

---

## 5. 验证计划

### 5.1 构建验证

```bash
# 1. 格式化代码
pnpm format:write

# 2. 代码质量检查
pnpm lint:check

# 3. 类型检查
pnpm type-check

# 4. 构建检查
pnpm build:check

# 5. Bundle 大小检查
pnpm size:check
```

### 5.2 Bundle 分析

```bash
# 生成 Bundle Analyzer 报告
ANALYZE=true pnpm build

# 检查点：
# 1. vendors chunk 大小是否减少 ~11 kB（Brotli）
# 2. @floating-ui/dom 是否不在首屏 vendors chunk
# 3. NavigationMenu 是否被拆分到独立 chunk
```

### 5.3 功能验证

**桌面端**:
- [ ] 导航菜单正常显示
- [ ] Products 下拉菜单正常工作
- [ ] 悬停交互正常（80ms 延迟）
- [ ] 点击导航链接正常跳转
- [ ] Loading skeleton 显示正常

**移动端**:
- [ ] 移动导航正常工作（不受影响）
- [ ] 语言切换正常

**主题切换**:
- [ ] 亮色主题下 loading skeleton 正常
- [ ] 暗色主题下 loading skeleton 正常

**国际化**:
- [ ] 英文导航正常
- [ ] 中文导航正常

### 5.4 性能验证

```bash
# 运行 Lighthouse CI
pnpm lhci autorun

# 检查点：
# 1. Performance Score 是否改善
# 2. LCP 是否改善或保持
# 3. TTI 是否改善或保持
```

---

## 6. 后续优化

### 6.1 P0.2: Tooltip/Popover 延后

**目标**: 首页非首屏必要的弹层组件改为动态导入

**预期收益**: -5~10 kB（Brotli）

### 6.2 P1.1: next-intl 客户端瘦身

**目标**: 避免在全局客户端树中过度使用 next-intl

**预期收益**: -5~10 kB（Brotli）

### 6.3 P1.2: 富文本消息解析降级

**目标**: 首页降级为简单文案，减少 formatjs 传导依赖

**预期收益**: -3~5 kB（Brotli）

---

## 7. 总结

### 7.1 优化亮点

1. ✅ **精准定位**：通过 Bundle Analyzer 精确识别 @floating-ui 依赖链路
2. ✅ **最小改动**：只修改 1 个文件（nav-switcher.tsx）
3. ✅ **渐进增强**：保持现有功能，添加 loading 状态
4. ✅ **风险可控**：不影响 SEO、可访问性、国际化

### 7.2 预期收益

- **Vendors chunk**: -11 kB（Brotli），-29 kB（Parsed）
- **首屏加载**: 改善
- **用户体验**: 轻微延迟（~100-200ms），可接受

### 7.3 下一步行动

1. ✅ 确认优化方案
2. ⏳ 修改 nav-switcher.tsx
3. ⏳ 运行质量检查
4. ⏳ 运行 Bundle 分析
5. ⏳ 功能验证
6. ⏳ 性能验证
7. ⏳ 提交代码

---

**Updated**: 2025-01-XX
**Status**: 待执行
**Assignee**: AI Assistant

