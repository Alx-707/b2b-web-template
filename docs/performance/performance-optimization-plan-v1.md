# 性能优化系列任务规划方案 v1.0

**创建时间**: 2025-01-XX
**状态**: 待GPT-5审核
**目标**: 达成企业级性能标准（Performance≥0.90，LCP≤3.0s稳定）

---

## 一、背景与目标

### 1.1 当前状态（基于GPT-5测试报告）

**已完成优化**：
- ✅ Shared Chunks从648.7 kB降至315.6 kB（≤320 kB目标）
- ✅ Sentry按需加载（src/lib/sentry-client.ts）
- ✅ Hero/在建页延迟渲染+skeleton
- ✅ 导航/主题动态分包
- ✅ 首页次要区块动态引入

**待解决问题**：
- ❌ LCP不稳定：目标≤3.0s，实际波动3.2-4.6s（移动端仿真）
- ❌ 缺乏RUM监控验证真实用户体验
- ❌ 图片优化未全局审计
- ❌ 字体优化未完全落地（缺少中文字体子集）
- ❌ INP专项优化未启动

### 1.2 核心目标（Definition of Done）

**性能核心指标**：
- 首页Performance ≥ 0.90（移动端仿真，LHCI中位数）
- LCP ≤ 3.0s（稳定达成，波动≤10%）
- TBT ≤ 200ms，CLS = 0，INP ≤ 200ms
- FCP ≤ 1.5s

**体积预算守门**：
- Shared Chunks（brotli）≤ 320 kB（已达成，持续守门）
- Vendors ≤ 240 kB，React ≤ 60 kB
- 单路由增量JS ≤ 50 kB，总CSS ≤ 50 kB
- Polyfills ≤ 40 kB

**质量守门**：
- LHCI关键URL中位数指标通过
- Size-Limit全部分组通过
- 构建无阻塞错误
- a11y ≥ 0.95，SEO ≥ 0.95

---

## 二、架构分析与重复功能检测

### 2.1 现有基础设施（已实现）

**性能监控体系**：
- ✅ Web Vitals收集器：src/lib/web-vitals/（collector.ts、baseline-manager.ts、regression-detector.ts）
- ✅ RUM监控：src/components/monitoring/enterprise-analytics.tsx（已集成@vercel/analytics）
- ✅ 性能分析器：scripts/performance-analyzer.js（基准对比、回归检测）
- ✅ Lighthouse CI配置：lighthouserc.js（9个URL，3次运行）
- ✅ Size-Limit配置：.size-limit.js（8个预算规则）

**CI/CD守门**：
- ✅ 基础检查：.github/workflows/ci.yml（type-check、lint、format、size:check、build:check）
- ❌ LHCI自动化：未集成
- ❌ 回归检测：未集成

### 2.2 重复功能识别

**任务2.1 RUM监控集成**：
- **发现**：EnterpriseAnalytics组件已实现RUM监控（line 102-138）
- **调整**：改为"RUM监控验证与增强"
- **新增**：scripts/query-rum-p75.js（查询P75数据）

**任务2.3 性能回归检测**：
- **发现**：scripts/performance-analyzer.js已有回归检测逻辑（line 579-608）
- **调整**：改为"回归检测CI集成"
- **新增**：CI步骤 + 基准文件提交

**任务1.3 字体加载优化**：
- **发现**：docs/performance-audit-report.md已有中文字体配置示例（line 206-221）
- **调整**：参考示例添加Noto_Sans_SC配置
- **新增**：环境变量NEXT_PUBLIC_ENABLE_CN_FONT_SUBSET控制

---

## 三、任务分层规划（5层15任务）

### P0层：紧急优化（LCP稳定化）- 3任务

#### 任务P0.1：LHCI自动化集成
**目标**：提供LCP基准数据，指导优化方向
**优先级**：P0（最高）
**依赖**：无
**文件**：.github/workflows/ci.yml
**验收**：PR自动运行LHCI，Performance<0.9时CI失败

#### 任务P0.2：Hero背景轻量化（移动端）
**目标**：移动端LCP元素固定为H1文本
**优先级**：P0
**依赖**：无
**文件**：src/components/home/hero-section.tsx
**验收**：移动端背景绘制≤5ms，LCP改善≥15%

#### 任务P0.3：图片优化全局审计与修复
**目标**：首屏图片总解码像素≤视窗1.5×
**优先级**：P0
**依赖**：无
**文件**：scripts/audit-images.js + 全局图片文件
**验收**：首屏图片priority正确，CLS=0

#### 任务P0.4：字体加载策略优化
**目标**：中文页面LCP改善≥200ms
**优先级**：P0
**依赖**：无
**文件**：src/app/[locale]/layout-fonts.ts
**验收**：中文字体子集加载，display: swap生效

### P1层：监控与守门（持续验证）- 3任务

#### 任务P1.1：RUM监控验证与增强
**目标**：生产环境7天P75数据可查
**优先级**：P1
**依赖**：P0.1-P0.4完成（需先优化LCP再建立基线）
**文件**：scripts/query-rum-p75.js
**验收**：RUM P75 LCP≤3.0s

#### 任务P1.2：性能回归检测CI集成
**目标**：CI自动检测回归，超阈值时失败
**优先级**：P1
**依赖**：P0.1-P0.4完成（需先建立基准）
**文件**：.github/workflows/ci.yml + performance-baseline.json
**验收**：回归检测超阈值时CI失败并提供报告

#### 任务P1.3：LHCI阈值优化与报告增强
**目标**：LHCI阈值对齐GPT-5目标（LCP≤3000ms）
**优先级**：P1
**依赖**：P0.1完成
**文件**：lighthouserc.js
**验收**：LHCI断言LCP≤3000ms，提供详细报告链接

### P2层：体积持续优化（Bundle/Sentry/字体）- 4任务

#### 任务P2.1：Vendors分包细化 ✅ 已完成
**目标**：Vendors≤240 kB（brotli）
**优先级**：P2
**依赖**：无（可与P0/P1并行）
**文件**：next.config.ts, package.json
**完成日期**：2025-10-02
**实际成果**：
- ✅ Bundle大小：373 kB → 323 kB（-50 kB, -13.4%）
- ✅ vendors chunk：224 kB → 174 kB（-50 kB, -22.3%）
- ✅ LCP改善：4533-4698ms → 4374-4537ms（-150ms）
- ✅ TTI改善：4770-4794ms → 4609-4635ms（-150ms）

**优化措施**：
- 移除motion库（~100 kB）
- @vercel/analytics动态导入
- 新增analytics-libs和ui-libs chunks

**详细报告**：docs/performance/p2-1-bundle-optimization-report.md

#### 任务P2.2：细粒度size-limit守门 🆕 推荐
**目标**：为每个chunk设置独立门限，防止单个vendor暴涨
**优先级**：P2（高）
**依赖**：P2.1完成
**文件**：.size-limit.js
**验收**：
- React chunk ≤ 60 KB
- Radix UI chunk ≤ 80 KB
- Analytics chunk ≤ 30 KB
- UI chunk ≤ 40 KB
- 所有chunk独立监控

**说明**：不修改next.config.ts，符合项目约束

#### 任务P2.3：Sentry延迟加载 🆕 推荐
**目标**：减少90 kB首屏加载
**优先级**：P2（高）
**依赖**：无
**文件**：src/lib/sentry-client.ts
**验收**：
- 首屏Bundle减少≥80 kB
- 仅生产环境加载
- 错误监控功能完整

**预期效果**：LCP改善100-150ms

#### 任务P2.4：中文字体子集化 🆕 可选
**目标**：中文页面LCP改善150-250ms
**优先级**：P2（中）
**依赖**：无
**文件**：src/app/[locale]/layout-fonts.ts
**验收**：
- 通过环境变量控制（NEXT_PUBLIC_ENABLE_CN_FONT_SUBSET）
- 字体文件大小减少94.7%
- 中文页面LCP改善≥150ms

**说明**：需要生成字体子集文件

### P3层：可访问性与SEO（质量守门）- 2任务

#### 任务P3.1：可访问性审计与修复
**目标**：所有关键页面a11y≥0.95
**优先级**：P3
**依赖**：P0.1完成（LHCI提供a11y基准）
**文件**：全局组件 + jest-axe测试
**验收**：LHCI a11y≥0.95，jest-axe测试通过

#### 任务P3.2：SEO优化与结构化数据
**目标**：所有关键页面SEO≥0.95
**优先级**：P3
**依赖**：P0.1完成
**文件**：src/app/[locale]/layout-metadata.ts + layout-structured-data.ts
**验收**：LHCI SEO≥0.95，结构化数据完整

### P4层：长期演进（INP/预取/错误预算）- 3任务

#### 任务P4.1：INP专项优化
**目标**：INP≤200ms（P75）
**优先级**：P4
**依赖**：P1.1完成（RUM提供INP基线）
**文件**：交互热点组件
**验收**：RUM P75 INP≤200ms

#### 任务P4.2：预取策略实现
**目标**：关键路由FCP改善≥100ms
**优先级**：P4
**依赖**：P0完成（不挤占首屏预算）
**文件**：src/components/layout/navigation组件
**验收**：关键路由FCP改善≥100ms

#### 任务P4.3：错误预算与告警
**目标**：性能回归时自动告警
**优先级**：P4
**依赖**：P1.2完成（回归检测已集成）
**文件**：scripts/performance-alert.js
**验收**：性能回归时自动告警（Slack/Email）

---

## 四、技术实施细节

### 4.1 任务间接口定义

**图片审计清单格式**（任务P0.3输出）：
```typescript
interface ImageAuditResult {
  path: string;
  type: 'img' | 'next/image';
  hasPriority: boolean;
  width?: number;
  height?: number;
  isAboveFold: boolean;
  issues: string[];
}
```

**RUM P75数据格式**（任务P1.1输出）：
```typescript
interface RUMP75Data {
  metric: 'LCP' | 'INP' | 'CLS' | 'FCP';
  p75: number;
  p50: number;
  p90: number;
  sampleSize: number;
  timeRange: { start: string; end: string };
}
```

**性能回归报告格式**（任务P1.2输出）：
```typescript
interface RegressionReport {
  detected: boolean;
  details: Array<{
    metric: string;
    baseline: number;
    current: number;
    change: number;
    threshold: number;
    severity: 'critical' | 'warning';
  }>;
}
```

### 4.2 新增文件清单

```
scripts/
├── audit-images.js          # P0.3：图片审计脚本
├── query-rum-p75.js          # P1.1：RUM P75查询脚本
└── performance-alert.js      # P4.3：性能告警脚本

src/app/[locale]/
└── layout-fonts.ts           # P0.4：添加中文字体配置

.github/workflows/
└── ci.yml                    # P0.1/P1.2：LHCI + 回归检测集成
```

### 4.3 修改文件清单

```
src/components/home/
└── hero-section.tsx          # P0.2：Hero背景轻量化

next.config.ts                # P2.1/P2.2/P2.3：分包/CSS/Polyfills优化
lighthouserc.js               # P1.3：LHCI阈值调整
.size-limit.js                # P2.1：Vendors预算调整
```

---

## 五、验收标准与回滚策略

### 5.1 全局验收标准

**质量检查**（每个任务必须通过）：
```bash
pnpm format:check && pnpm lint:check && pnpm type-check && pnpm build:check
```

**性能验收**（P0完成后）：
```bash
pnpm build && pnpm start
pnpm exec lhci autorun --config=lighthouserc.js

# 验收标准
- 首页LCP中位数≤3.0s（3次运行波动≤10%）
- Performance≥0.90
- TBT≤200ms，CLS=0
```

**RUM验收**（P1完成后）：
```bash
node scripts/query-rum-p75.js --metric=LCP --days=7

# 验收标准
- RUM P75 LCP≤3.0s
- RUM P75 INP≤200ms
- RUM P75 CLS≤0.1
```

### 5.2 回滚策略

**P0任务回滚**：
```bash
# 单个任务回滚
git revert <commit-hash>
pnpm build && pnpm start

# 字体优化回滚（环境变量控制）
export NEXT_PUBLIC_ENABLE_CN_FONT_SUBSET=false
pnpm build && pnpm start
```

**P1任务回滚**：
```bash
# LHCI/回归检测回滚
git revert <commit-hash> # 移除CI步骤
rm performance-baseline.json # 删除基准文件（如需要）
```

---

## 六、风险评估与缓解

### 6.1 风险矩阵

| 任务 | 风险等级 | 风险描述 | 缓解措施 |
|------|---------|---------|---------|
| P0.1 LHCI | 中 | CI耗时增加10-15分钟 | 仅关键URL每次运行，其他URL每日定时 |
| P0.2 Hero | 低 | 视觉效果降级 | 桌面端保留渐变，仅移动端简化 |
| P0.3 图片 | 低 | 修复工作量大 | 分批修复，优先首屏 |
| P0.4 字体 | 低 | 中文字体加载失败 | 环境变量控制，默认关闭 |
| P1.1 RUM | 低 | 已实现，仅需验证 | 无 |
| P1.2 回归 | 低 | 基准文件冲突 | 定期更新基准，版本控制 |

### 6.2 执行顺序建议（已更新）

**第一阶段（1-2周）** ✅ 已完成：
1. ✅ P0.1 LHCI自动化（提供基准数据）
2. ✅ P0.2/P0.3/P0.4并行（Hero/图片/字体优化）
3. ✅ P0.1验证优化效果
4. ✅ P2.1 Vendors分包细化（Bundle优化-50 kB）

**第二阶段（当前）** 🔄 进行中：
5. P2.2 细粒度size-limit守门（高优先级）
6. P2.3 Sentry延迟加载（高优先级）
7. P1.1 RUM监控验证
8. P1.2 回归检测CI集成

**第三阶段（1-2周）**：
9. P2.4 中文字体子集化（可选）
10. P1.3 LHCI阈值优化
11. P3.1/P3.2并行（a11y/SEO）

**第四阶段（长期）**：
12. P4层任务（INP优化、预取策略、告警系统）

**第四阶段（长期）**：
9. P4.1/P4.2/P4.3渐进式（INP/预取/告警）

---

## 七、预期收益

**性能提升**：
- LCP改善≥25%（3.2-4.6s → ≤3.0s稳定）
- Performance分数提升≥0.05（0.85 → ≥0.90）
- TBT保持≤200ms，CLS保持=0

**体积优化**：
- Shared Chunks保持≤320 kB
- Vendors优化至≤240 kB
- 总CSS优化至≤50 kB

**质量守门**：
- CI/CD自动化守门（LHCI + 回归检测）
- RUM真实用户数据验证（P75指标）
- a11y/SEO达标（≥0.95）

---

## 八、待GPT-5审核要点

1. **任务分层是否合理**？（P0紧急→P1监控→P2体积→P3质量→P4长期）
2. **重复功能识别是否准确**？（RUM已实现、回归检测已存在）
3. **验收标准是否量化**？（LCP≤3.0s、Performance≥0.90）
4. **回滚策略是否可行**？（git revert可回滚、环境变量控制）
5. **风险评估是否全面**？（LHCI耗时、视觉降级、字体加载失败）
6. **执行顺序是否优化**？（LHCI先行提供基准、P0并行优化）

**请GPT-5审核并提供反馈，确认无误后将生成详细任务清单（shrimp格式）。**

