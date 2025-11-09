# P0 + P1 翻译优化实施计划

> **批准日期**：2025-01-08  
> **预计完成**：2025-01-09  
> **总工作量**：4-6 小时  
> **预期收益**：节省 29 KB，First Load JS: 228 KB → 199 KB (-12.7%)

---

## 📋 目录

1. [执行概览](#执行概览)
2. [P0 优先级任务](#p0-优先级任务)
3. [P1 优先级任务](#p1-优先级任务)
4. [验证清单](#验证清单)
5. [风险管理](#风险管理)

---

## 执行概览

### 任务优先级

| 优先级 | 任务 | 工作量 | 收益 | 状态 |
|--------|------|--------|------|------|
| **P0-1** | 移除 DeferredTranslationsProvider | 0.5h | 11 KB | ⏳ 待执行 |
| **P0-2** | 修正缓存命中率统计 | 0.5h | 0 KB | ⏳ 待执行 |
| **P1-1** | 翻译文件外部化 | 2-4h | 18 KB | ⏳ 待执行 |
| **P1-2** | 创建维护文档 | 1h | 0 KB | ⏳ 待执行 |

### 执行顺序

```
P0-1 (移除 Provider) → P0-2 (修正统计) → P1-1 (外部化) → P1-2 (文档)
     ↓                      ↓                  ↓                ↓
  验证构建              验证统计           验证性能          最终验收
```

### 依赖关系

- **P0-1 和 P0-2**：独立任务，可并行执行
- **P1-1**：依赖 P0 完成（确保基础稳定）
- **P1-2**：依赖 P1-1 完成（记录最终实现）

---

## P0 优先级任务

### P0-1: 移除无效的 DeferredTranslationsProvider

**目标**：从首页移除无效的 Provider，节省 11 KB 网络传输

**工作量**：0.5 小时

#### 步骤 1：修改 page.tsx

**文件**：`src/app/[locale]/page.tsx`

**修改内容**：

```typescript
// 删除导入 (line 4)
- import { DeferredTranslationsProvider } from '@/components/i18n/deferred-translations-provider';

// 修改组件使用 (line 65-71)
- <DeferredTranslationsProvider locale={locale}>
-   <TechStackSection />
-   <ComponentShowcase />
-   <ProjectOverview />
-   <CallToAction />
- </DeferredTranslationsProvider>

+ <Suspense fallback={null}>
+   <TechStackSection />
+   <ComponentShowcase />
+   <ProjectOverview />
+   <CallToAction />
+ </Suspense>
```

**验证方法**：
```bash
# 1. 类型检查
pnpm type-check

# 2. 构建测试
pnpm build

# 3. 本地测试
pnpm dev
# 访问 http://localhost:3000/en
# 打开 Chrome DevTools → Network
# 验证不再加载 deferred.json
```

**预期结果**：
- ✅ 类型检查通过
- ✅ 构建成功
- ✅ Network 面板不再显示 deferred.json 请求
- ✅ 首页正常渲染

---

### P0-2: 修正缓存命中率统计 key

**目标**：修正缓存统计 key 不一致问题，确保性能监控准确

**工作量**：0.5 小时

#### 步骤 1：修改 request.ts

**文件**：`src/i18n/request.ts`

**修改内容**：

```typescript
// 修改 line 53
- const cached = cache.get(`messages-${locale}`);
+ const cached = cache.get(`messages-${locale}-critical`);
```

**验证方法**：
```bash
# 1. 类型检查
pnpm type-check

# 2. 运行应用并检查日志
pnpm dev
# 访问首页多次
# 检查控制台日志中的缓存命中率统计
```

**预期结果**：
- ✅ 类型检查通过
- ✅ 缓存命中率统计正常工作（第二次访问应显示命中）

---

## P1 优先级任务

### P1-1: 翻译文件外部化

**目标**：将翻译文件从 JS bundle 分离，降低 First Load JS ~18 KB

**工作量**：2-4 小时

#### 步骤 1：创建翻译拷贝脚本

**文件**：`scripts/copy-translations.js`

**内容**：见下方完整代码

**验证方法**：
```bash
node scripts/copy-translations.js
# 检查 public/messages/en/critical.json 是否生成
# 检查 public/messages/zh/critical.json 是否生成
```

#### 步骤 2：创建翻译加载 helper

**文件**：`src/lib/load-messages.ts`

**内容**：见下方完整代码

**验证方法**：
```bash
pnpm type-check
```

#### 步骤 3：更新 layout.tsx

**文件**：`src/app/[locale]/layout.tsx`

**修改内容**：

```typescript
// 删除静态导入 (line 18-19)
- import enMessages from '@messages/en/critical.json';
- import zhMessages from '@messages/zh/critical.json';

// 添加动态加载导入
+ import { loadCriticalMessages } from '@/lib/load-messages';

// 修改组件内部 (line 40-45)
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // 动态加载翻译
+ const messages = await loadCriticalMessages(locale as 'en' | 'zh');

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
-       <NextIntlClientProvider locale={locale} messages={locale === 'en' ? enMessages : zhMessages}>
+       <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### 步骤 4：更新 page.tsx

**文件**：`src/app/[locale]/page.tsx`

**修改内容**：

```typescript
// 删除静态导入 (line 7-8)
- import enMessages from '@messages/en/critical.json';
- import zhMessages from '@messages/zh/critical.json';

// 添加动态加载导入
+ import { loadCriticalMessages } from '@/lib/load-messages';

// 修改 extractHeroMessages 调用
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
+ const messages = await loadCriticalMessages(locale as 'en' | 'zh');
- const heroMessages = extractHeroMessages(locale === 'en' ? enMessages : zhMessages);
+ const heroMessages = extractHeroMessages(messages);

  // ... rest of the code
}
```

#### 步骤 5：更新 package.json

**文件**：`package.json`

**修改内容**：

```json
{
  "scripts": {
+   "prebuild": "node scripts/copy-translations.js",
    "build": "next build",
    "split:translations": "node scripts/split-translations.js",
    "validate:translations": "node scripts/validate-translations.js"
  }
}
```

#### 步骤 6：更新 .gitignore

**文件**：`.gitignore`

**修改内容**：

```
# 添加构建时生成的翻译文件
public/messages/
```

#### 步骤 7-10：验证

**验证清单**：
```bash
# 7. 类型安全验证
pnpm type-check

# 8. 构建测试
pnpm build
# 检查 prebuild 脚本是否自动运行
# 检查 public/messages/ 是否生成

# 9. Bundle 分析
ANALYZE=true pnpm build
# 检查 layout.js 和 page.js 是否不再包含翻译内容

# 10. 性能测试
pnpm build && pnpm start
# 运行 Lighthouse
# 记录 First Load JS、FCP、LCP
```

---

### P1-2: 创建维护文档

**目标**：创建 `docs/i18n-optimization.md`，记录翻译架构和维护规则

**工作量**：1 小时

#### 步骤 1：创建文档框架

**文件**：`docs/i18n-optimization.md`

**内容结构**：
1. 翻译架构说明
2. CRITICAL_KEYS 维护规则
3. 外部化方案工作原理
4. 如何添加新翻译
5. 故障排查指南

#### 步骤 2-4：补充内容

见完整文档内容（将在后续步骤创建）

---

## 验证清单

### P0 验证

- [ ] P0-1: DeferredTranslationsProvider 已移除
- [ ] P0-1: 类型检查通过
- [ ] P0-1: 构建成功
- [ ] P0-1: Network 不再加载 deferred.json
- [ ] P0-2: 缓存 key 已修正
- [ ] P0-2: 缓存命中率统计正常

### P1 验证

- [ ] P1-1: copy-translations.js 脚本创建
- [ ] P1-1: load-messages.ts helper 创建
- [ ] P1-1: layout.tsx 使用动态加载
- [ ] P1-1: page.tsx 使用动态加载
- [ ] P1-1: package.json prebuild 配置
- [ ] P1-1: .gitignore 更新
- [ ] P1-1: 类型安全验证通过
- [ ] P1-1: 构建测试通过
- [ ] P1-1: Bundle 分析确认分离
- [ ] P1-1: 性能测试达标
- [ ] P1-2: 维护文档创建完成

### 最终验证

- [ ] First Load JS: 228 KB → 199 KB (-12.7%)
- [ ] FCP 改善: ~50-100ms
- [ ] LCP 改善: ~30-50ms
- [ ] 所有页面正常渲染
- [ ] 翻译功能正常工作
- [ ] 无 TypeScript 错误
- [ ] 无构建错误

---

## 风险管理

### 风险 1：TypeScript 类型丢失

**严重性**：🔴 高

**缓解措施**：
- 保留 `messages/` 目录作为类型源
- `public/messages/` 仅用于运行时加载
- 验证 `strictMessageTypeSafety` 仍然工作

**验证方法**：
```bash
pnpm type-check
# 检查是否有类型错误
```

---

### 风险 2：SSR 性能下降

**严重性**：🟡 中

**缓解措施**：
- 使用 `unstable_cache` 缓存翻译
- 设置 `revalidate: 3600`（1 小时）
- 添加 fallback 机制

**验证方法**：
```bash
# 使用 Chrome DevTools Performance 测试 SSR 时间
```

---

### 风险 3：构建流程复杂化

**严重性**：🟡 中

**缓解措施**：
- 使用 `prebuild` 脚本自动化
- 添加错误处理和日志
- 文档记录构建流程

**验证方法**：
```bash
pnpm build
# 检查 prebuild 是否自动运行
# 检查是否有错误日志
```

---

### 风险 4：开发体验变差

**严重性**：🟢 低

**缓解措施**：
- 开发环境仍使用快速的动态导入
- 生产环境使用外部化方案
- 保持 HMR 正常工作

**验证方法**：
```bash
pnpm dev
# 修改翻译文件
# 检查 HMR 是否正常
```

---

## 附录：完整代码

### scripts/copy-translations.js

见下一个文件创建步骤

### src/lib/load-messages.ts

见下一个文件创建步骤

---

**文档结束**

如有疑问，请参考 `docs/i18n-optimization-journey.md` 了解完整的优化历程。

