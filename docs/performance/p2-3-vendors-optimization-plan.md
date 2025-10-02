# P2.3 Vendors Chunk 优化方案

**创建时间**: 2025-10-02  
**状态**: 进行中  
**优先级**: P2（体积优化）

## 任务目标

优化 vendors chunk 大小，从当前 575K（原始）降至 ≤400K，Brotli 从 174 kB 降至 ≤150 kB。

## 当前状态

### Bundle 构建结果

```
Route (app)                                 Size  First Load JS
├ ƒ /[locale]                            14.1 kB         382 kB
+ First Load JS shared by all             323 kB
  ├ chunks/0a4bdfb2-32a22f15c36def40.js  54.4 kB
  ├ chunks/sentry-58a448693dca7e67.js      90 kB
  ├ chunks/vendors-7b3bd6887911b03b.js    174 kB  ⚠️ 目标 ≤150 kB
  └ other shared chunks (total)          3.84 kB
```

**问题**：
- Vendors chunk：174 kB（Brotli），约 575 kB（原始）
- 总 First Load JS：323 kB（目标 ≤320 kB，超出 3 kB）

### 已分离的 cacheGroups（10个）

| cacheGroup | Priority | 包含库 | 状态 |
|-----------|----------|--------|------|
| react | 20 | react、react-dom | ✅ 已分离 |
| radix-ui | 15 | @radix-ui/* | ✅ 已分离 |
| lucide | 15 | lucide-react | ✅ 已分离 |
| sentry | 15 | @sentry/* | ✅ 已分离 |
| nextjs | 10 | next-intl、@next/*、next-themes、nextjs-toploader | ✅ 已分离 |
| mdx | 12 | @mdx-js、gray-matter、remark、rehype | ✅ 已分离 |
| validation | 12 | zod | ✅ 已分离 |
| utils | 8 | clsx、class-variance-authority、tailwind-merge、embla-carousel | ✅ 已分离 |
| analytics | 14 | @vercel/analytics、web-vitals | ✅ 已分离 |
| ui | 11 | sonner、@marsidev/react-turnstile | ✅ 已分离 |

## GPT-5 分析结论

### 根因

vendors chunk（174 kB Brotli，575 kB 原始）主要包含：

1. **@floating-ui 全家桶**（core/dom/react-dom）
   - Radix 弹层/菜单依赖
   - 常见在导航/Header 中被引入
   - 预估大小：12-20 kB（Brotli）

2. **formatjs/intl 相关**
   - next-intl 的底层依赖（intl-messageformat、parser、localematcher）
   - 客户端层面被引入
   - 预估大小：8-12 kB（Brotli）

3. **共享依赖拼接**
   - 多组 cacheGroups 的共同小依赖（nanoid、fast-deep-equal、object-hash 等）
   - 累计不可忽视
   - 预估大小：5-10 kB（Brotli）

### 已排除的假设

1. **服务端库误打包** ❌
   - 客户端组件（src/components/）**未导入**服务端库（airtable、resend、whatsapp）
   - 服务端库不应打包到客户端 vendors chunk

2. **字体库占用空间** ❌
   - geist 字体使用 `next/font/google` 优化
   - 字体文件由 Next.js 单独加载，不在 vendors chunk

## 优化方案

### P0：精确切割首屏触发的大依赖 ✅ **立即执行**

#### 1. Header 拆分

**目标**：将使用弹层/菜单的子模块从 Header 主体剥离为动态导入。

**实施步骤**：
1. 识别 Header 中使用 @floating-ui 的组件（如 DropdownMenu、NavigationMenu）
2. 改为 `dynamic(() => import('./HeaderMenu'), { ssr: false, loading: <Skeleton/> })`
3. 延后到 requestIdleCallback 或视口内触发

**预期收益**：-15 kB（Brotli）

#### 2. Tooltip/Popover 延后

**目标**：非必要的 Radix 弹层类组件延后加载。

**实施步骤**：
1. 将首页非首屏必要的弹层、提示、富交互组件改为动态导入
2. 交互发生时再加载或替换为无浮层版本

**预期收益**：-5~10 kB（Brotli）

### P1：降低 i18n 客户端体积 ✅ **推荐**

#### 1. next-intl 客户端用量瘦身

**目标**：避免在全局客户端树中过度使用 navigation 包装器。

**实施步骤**：
1. 仅在需要处引入 next-intl
2. 能被 RSC 下推的逻辑尽量留在服务端

**预期收益**：-5~10 kB（Brotli）

#### 2. 富文本消息解析

**目标**：首页降级为简单文案，减少 formatjs 传导依赖。

**实施步骤**：
1. 避免在首页使用复杂 ICU 格式
2. 保持含义不变，简化文案 token

**预期收益**：-3~5 kB（Brotli）

### P1.5：监控/指示器延后 ✅ **已完成**

- EnterpriseAnalytics 已动态加载 web-vitals
- 调试型 UI 仅在开发态加载

### P2：替代/拆分中等体积库 ⚠️ **可选**

**目标**：单页或低频交互的库改为页面级动态导入。

**实施步骤**：
1. 使用 source-map-explorer 识别 Top10 中的中等体积库
2. 改为页面级 dynamic import

**预期收益**：-5~12 kB（Brotli）

## 预期总效果

| 方案 | Brotli 减少 | 原始减少 | 累计 Brotli | 累计原始 |
|------|------------|---------|------------|---------|
| 初始状态 | - | - | 174 kB | 575 kB |
| P0: Header 拆分 | -15 kB | -50 kB | 159 kB | 525 kB |
| P0: Tooltip/Popover 延后 | -5~10 kB | -20~30 kB | 149~154 kB | 495~505 kB |
| P1: i18n 瘦身 | -8~12 kB | -30~40 kB | 137~146 kB | 455~475 kB |
| P2: 中等库拆分 | -5~12 kB | -20~40 kB | 125~141 kB | 415~455 kB |

**结论**：
- **Brotli**：-28~49 kB（174 kB → 125-146 kB，✅ 达成目标 ≤150 kB）
- **原始**：-100~160 kB（575 kB → 415-475 kB，⚠️ 接近目标 ≤400 kB）

## 执行步骤

### 第一步：分析 vendors 内容

```bash
# 安装 source-map-explorer
pnpm add -D source-map-explorer

# 生成 vendors 分析报告
pnpm exec source-map-explorer ".next/static/chunks/vendors-*.js" --json > reports/vendors-analysis.json

# 按包名聚合
pnpm exec source-map-explorer ".next/static/chunks/vendors-*.js" --replace "^./node_modules/([^/]+/)?([^/]+)/.*$" "$1$2" --json > reports/vendors-bypkg.json
```

### 第二步：Header 拆分（P0）

1. 识别 Header 中使用弹层/菜单的子模块
2. 改为动态导入
3. 验证构建结果

### 第三步：验证

```bash
# 构建
pnpm build

# 检查 size-limit
pnpm size:check

# 运行 LHCI
pnpm exec lhci autorun
```

## 验收标准

1. **Vendors chunk ≤150 kB**（Brotli）
2. **Vendors chunk ≤400 kB**（原始）
3. **总 First Load JS ≤320 kB**
4. **所有质量检查通过**：
   - `pnpm format:check`
   - `pnpm lint:check`
   - `pnpm type-check`
   - `pnpm build:check`
   - `pnpm size:check`
5. **LHCI 性能无回退**：
   - Performance Score ≥0.82
   - LCP ≤4500ms
   - TTI ≤4700ms

## 风险与回滚

### 风险

1. **动态导入过度导致首交互抖动**
   - 缓解：对可交互组件加 loading 骨架与预取（路由空闲后预取）

2. **菜单/弹层行为差异**
   - 缓解：优先在非首屏路径与低频交互处试点；保留 feature flag 便于回滚

3. **监控一致性**
   - 缓解：改造前后对比 LHCI 和 RUM P75，确认性能提升而非仅"分数提升"

### 回滚策略

```bash
# 回滚到优化前的 commit
git revert <commit-hash>

# 重新构建
pnpm build

# 验证
pnpm size:check
```

## 参考文档

- `next.config.ts`（lines 89-195）：splitChunks 配置
- `.size-limit.js`（lines 64-69）：Vendors Bundle 门限
- `docs/performance/p2-1-bundle-optimization-report.md`：P2.1 完成报告
- `docs/performance/adjusted-task-list-after-p2-1.md`：调整后任务清单

