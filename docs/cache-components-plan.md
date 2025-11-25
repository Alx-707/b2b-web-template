# Next.js 16 Cache Components 启用与 next-intl 兼容方案

## 背景与目标
- 目标：在保持现有 i18n 体验的前提下，启用 Cache Components（含 PPR/Activity），获得更快首屏与更好的路由状态保留，同时避免 next-intl 触发的 runtime API 约束错误。
- 现状要点：
  - `src/app/[locale]/layout.tsx` 已调用 `setRequestLocale`，符合显式 locale 要求。
  - 未使用 `"use cache"`，缓存粒度尚未下沉。
  - 风险点：同一文件中存在 `headers()` + `dynamic = 'force-static'` 组合，开启 cacheComponents 后会被判定为在静态段访问 runtime API。

## 官方最佳实践要点（Next.js 16）
- 默认动态，显式 `"use cache"` 才缓存；缓存粒度下沉到组件/函数。
- 访问 runtime API（`headers`/`cookies`/`searchParams`/`params`）必须在非缓存段，或放进 `<Suspense>`。
- i18n/locale 必须显式：`setRequestLocale` 或在 next-intl API 显式传入 `locale`，避免隐式 headers 推断。
- PPR：静态壳先返，动态内容流式填充；Activity 保留路由树与状态。

## 重点风险与对应策略
1) `src/app/[locale]/layout.tsx`：`headers()` 取 nonce + `dynamic = 'force-static'`。  
   - 策略：去掉 `force-static`，或将 nonce 逻辑拆到动态/Suspense 子组件，避免“静态段访问 runtime API”。
2) next-intl 隐式 locale 解析：`getTranslations()`/`getLocale()` 会使用 request 上下文。  
   - 策略：保持 `setRequestLocale` + 尽量显式传 `locale`，不要在未来的 `"use cache"` 段调用依赖 request 的 API。
3) 未来新增 `"use cache"` 的位置：  
   - 仅对与用户/locale 无关的重计算使用（配置、公共数据）。  
   - 带 runtime API 的逻辑保持动态或放入 `<Suspense>`，避免缓存段触发约束。

## 分阶段实施步骤
### 阶段 0：准备与梳理
- 确认 `setRequestLocale` 已存在（`src/app/[locale]/layout.tsx` ✅）。
- 列出 next-intl API 调用点，标记哪些依赖 request 上下文（如 `getTranslations()` 无参、`getLocale()`）。

### 阶段 1：修复 runtime API 冲突源
- 调整 `src/app/[locale]/layout.tsx`：
  - 方案 A：移除 `export const dynamic = 'force-static'`，保持路由动态。  
  - 方案 B：保留静态壳时，将 nonce 读取拆分为单独动态子组件并用 `<Suspense>` 包裹，确保 runtime API 不在静态段。
- 复查是否有其他 runtime API（当前仅此处）。

### 阶段 2：开启配置
- `next.config.ts` 增加 `cacheComponents: true`。保持 Conductor 关闭（已注明）。
- 若有实验/兼容 flag，确保未与 cacheComponents 冲突。

### 阶段 3：next-intl 使用规范化
- 所有 next-intl API 尽量显式传入 `locale`（如 `getTranslations({ locale, namespace })`）。  
- 依赖 request 的 API（`getTranslations()` 无参、`getLocale()` 等）不得放在未来的 `"use cache"` 段；若必须使用 runtime 数据，放在不缓存的组件或 `<Suspense>` 中。
- 若有测试 layout（`src/app/[locale]/layout-test.tsx`）实际参与渲染，需补 `setRequestLocale`。

### 阶段 4：可选的缓存下沉实践
- 选择与 locale/用户无关的重计算点添加 `"use cache"`，并配置：
  - `cacheLife('hours' | 'days' | 'max' | 自定义)` 控制 stale/revalidate/expire。
  - `cacheTag` + `revalidateTag/updateTag` 做细粒度失效。
- 明确禁止：在访问 runtime API 的组件/函数上加 `"use cache"`。

### 阶段 5：验证与监控
- 本地冒烟：`pnpm dev`，手动覆盖主路由，关注报错关键词：
  - `Uncached data was accessed outside of <Suspense>`
  - `runtime API in use cache`
- 快速质量检查：`pnpm lint:check`，`pnpm type-check`。若改动多，再补 `pnpm test`。
- 监控：上线后关注日志/Next.js diagnostics 是否有 PPR/Activity 相关异常。
- 回滚预案：保留 `cacheComponents` 开关，出现大面积错误时立即关闭。

## 上游跟踪
- Next.js 16.1/16.2 版本日志：关注 Cache Components/PPR/Activity 的 bugfix。
- next-intl 仓库 issue #1493（Cache Components/PPR/dynamicIO 支持）与后续官方集成指南。
- 若官方发布 rootParams 等新 API，再评估路由/i18n 层的配合成本（预计较小）。

## 收益预期
- 性能：PPR 静态壳先返，动态流式填充，提升首屏与感知速度。
- 体验：Activity 保留路由树和输入状态，后退/前进不丢状态。
- 运维：缓存粒度可控，可用 cacheLife/cacheTag 精细失效，减少重复计算。
- 稳定性：默认动态，显式缓存点可控，避免隐式静态化被动态代码破坏。

## 验收标准
- 关键路由在开启 `cacheComponents: true` 后无 runtime 约束报错。
- nonce 获取不再触发“静态段访问 runtime API”。
- next-intl 调用符合显式 locale/非缓存段访问规则。
- 冒烟 + lint/type-check 通过；必要时补最小化测试回归。
