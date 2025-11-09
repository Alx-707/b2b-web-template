# 已知问题记录

**最后更新**: 2025-11-07

---

## 🐛 当前已知问题

### 1. Turbopack + localFont 字体加载错误

**问题描述**:
```
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2%22,%22preload%22:true,%22has_size_adjust%22:true}'
```

**影响范围**:
- 开发环境（`pnpm dev --turbopack`）
- 仅影响 Turbopack 模式
- Webpack 模式正常

**根本原因**:
- Next.js 15.5.4 + Turbopack 的 bug
- `localFont` 配置中的 `preload: true` 参数被错误地编码到 URL 中
- URL 编码问题：`%22` (双引号), `%2C` (逗号) 等字符出现在模块路径中

**受影响文件**:
- `src/app/[locale]/layout-fonts.ts` (第 24-35 行)
- Geist Mono 字体配置

**临时解决方案**:
1. **方案 A**: 使用 Webpack 模式（推荐）
   ```bash
   # 修改 package.json
   "dev": "next dev"  # 移除 --turbopack
   ```

2. **方案 B**: 移除 `preload` 参数
   ```typescript
   export const geistMono = localFont({
     variable: '--font-geist-mono',
     src: [/* ... */],
     display: 'swap',
     // preload: true,  // 临时注释
   });
   ```

**永久解决方案**:
- 等待 Next.js 15.6+ 或 16.x 修复
- 跟踪 Issue: https://github.com/vercel/next.js/issues

**状态**: ⏳ 等待上游修复

**决策**: 暂不修复，等待 Next.js 更新

**验证方法**:
```bash
# 检查 Next.js 版本
pnpm list next

# 测试 Turbopack 模式
pnpm dev --turbopack

# 测试 Webpack 模式
pnpm dev
```

---

## 📋 历史问题（已解决）

### 1. CSP 警告 - "Refused to execute script" ✅

**解决时间**: 2025-11-07

**问题描述**:
```
Refused to execute script from '.../_next/static/css/...'
```

**解决方案**:
- 在 `src/config/security.ts` 的 `style-src` 中添加 `'unsafe-inline'`

**状态**: ✅ 已解决

---

### 2. 404 错误 - 8 个未实现页面 ✅

**解决时间**: 2025-11-07

**问题描述**:
- `/pricing`, `/support`, `/privacy`, `/terms` (英文和中文版)

**解决方案**:
- 从 `src/i18n/routing.ts` 移除这些路径

**状态**: ✅ 已解决

---

## 🔄 更新日志

| 日期 | 问题 | 状态 | 操作 |
|------|------|------|------|
| 2025-11-07 | Turbopack 字体加载错误 | ⏳ 等待修复 | 记录问题 |
| 2025-11-07 | CSP 警告 | ✅ 已解决 | 修复配置 |
| 2025-11-07 | 404 错误 | ✅ 已解决 | 移除路径 |

---

**维护人**: 开发团队

