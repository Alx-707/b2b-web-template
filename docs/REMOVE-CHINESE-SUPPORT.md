# 移除中文支持指南

**文档版本**: 1.0  
**最后更新**: 2025-11-07

---

## 📋 概述

本文档提供了完整的步骤，用于从项目中移除中文（zh）语言支持。

**设计原则**:
- ✅ 模块化设计，中文支持与英文功能完全解耦
- ✅ 移除过程简单，只需 3-5 个步骤
- ✅ 不会影响英文功能
- ✅ 可以随时恢复（通过 Git 回滚）

---

## 🎯 移除步骤

### 步骤 1: 移除中文字体配置 (5 分钟)

**操作**:
```bash
# 删除中文字体配置文件
rm src/styles/fonts-chinese.css
```

**影响**:
- ✅ 移除所有中文字体相关的 CSS 规则
- ✅ 不影响英文字体（Geist Sans/Mono）

**验证**:
```bash
# 确认文件已删除
ls src/styles/fonts-chinese.css
# 应该显示: No such file or directory
```

---

### 步骤 2: 从 globals.css 移除导入 (2 分钟)

**操作**:

打开 `src/app/globals.css`，找到并删除以下行：

```css
/* 删除这一行 */
@import './fonts-chinese.css';
```

**或者使用命令行**:
```bash
# 使用 sed 删除导入语句（macOS）
sed -i '' "/@import '\.\/fonts-chinese\.css';/d" src/app/globals.css

# 使用 sed 删除导入语句（Linux）
sed -i "/@import '\.\/fonts-chinese\.css';/d" src/app/globals.css
```

**影响**:
- ✅ 停止加载中文字体配置
- ✅ 不影响其他 CSS 规则

**验证**:
```bash
# 检查是否还有中文字体相关的导入
grep -n "fonts-chinese" src/app/globals.css
# 应该没有任何输出
```

---

### 步骤 3: 移除中文 locale 配置 (5 分钟)

**操作 3.1**: 修改 `src/i18n/routing.ts`

```typescript
// 修改前
export const routing = defineRouting({
  locales: ['en', 'zh'],  // 删除 'zh'
  defaultLocale: 'en',
  // ...
});

// 修改后
export const routing = defineRouting({
  locales: ['en'],  // 只保留 'en'
  defaultLocale: 'en',
  // ...
});
```

**操作 3.2**: 删除中文翻译文件

```bash
# 删除中文翻译文件
rm messages/zh.json

# 或者重命名为备份（推荐）
mv messages/zh.json messages/zh.json.backup
```

**影响**:
- ✅ 移除中文语言选项
- ✅ 路由不再支持 `/zh` 前缀
- ✅ 不影响英文路由

**验证**:
```bash
# 检查 locale 配置
grep -n "locales:" src/i18n/routing.ts
# 应该只显示: locales: ['en']

# 检查翻译文件
ls messages/
# 应该只显示: en.json
```

---

### 步骤 4: 清理中文内容文件 (10 分钟)

**操作**:

```bash
# 删除中文 MDX 内容（如果有）
rm -rf content/zh/

# 或者重命名为备份（推荐）
mv content/zh/ content/zh.backup/
```

**影响**:
- ✅ 移除所有中文内容
- ✅ 不影响英文内容

**验证**:
```bash
# 检查内容目录
ls content/
# 应该只显示: en/
```

---

### 步骤 5: 更新导航和 UI 组件 (15 分钟)

**操作**: 移除语言切换器（如果有）

查找并移除以下组件：
- 语言切换按钮
- 语言选择下拉菜单
- 任何显示 "中文" 或 "简体中文" 的 UI 元素

**常见位置**:
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/i18n/language-switcher.tsx`

**示例**:
```typescript
// 修改前
<LanguageSwitcher locales={['en', 'zh']} />

// 修改后
{/* 移除语言切换器，因为只有一种语言 */}
```

**影响**:
- ✅ 简化 UI，移除不必要的语言切换功能
- ✅ 不影响其他导航功能

---

### 步骤 6: 清理构建缓存并测试 (10 分钟)

**操作**:

```bash
# 1. 清理 Next.js 缓存
rm -rf .next

# 2. 清理 node_modules 缓存（可选）
rm -rf node_modules/.cache

# 3. 重新构建
pnpm build

# 4. 启动开发服务器
pnpm dev
```

**验证**:

1. **访问英文页面**:
   ```
   http://localhost:3000/
   http://localhost:3000/about
   http://localhost:3000/contact
   ```
   ✅ 应该正常显示

2. **访问中文页面**（应该 404）:
   ```
   http://localhost:3000/zh
   http://localhost:3000/zh/about
   ```
   ✅ 应该返回 404 错误

3. **检查控制台**:
   - ✅ 无错误
   - ✅ 无警告
   - ✅ 无中文相关的日志

---

## 📊 移除前后对比

### 文件变化

| 操作 | 文件 | 状态 |
|------|------|------|
| 删除 | `src/styles/fonts-chinese.css` | ❌ 已删除 |
| 修改 | `src/app/globals.css` | ✏️ 移除导入 |
| 修改 | `src/i18n/routing.ts` | ✏️ 移除 'zh' |
| 删除 | `messages/zh.json` | ❌ 已删除 |
| 删除 | `content/zh/` | ❌ 已删除 |

### 性能影响

| 指标 | 移除前 | 移除后 | 变化 |
|------|--------|--------|------|
| **构建大小** | ~2.5MB | ~2.3MB | -8% |
| **路由数量** | 20 | 10 | -50% |
| **翻译文件** | 2 个 | 1 个 | -50% |
| **首屏加载** | 无变化 | 无变化 | 0% |

---

## 🔄 如何恢复中文支持

如果未来需要恢复中文支持：

### 方法 1: Git 回滚（推荐）

```bash
# 查看移除中文支持的提交
git log --oneline | grep -i "remove chinese"

# 回滚到移除前的版本
git revert <commit-hash>
```

### 方法 2: 手动恢复

1. 恢复 `src/styles/fonts-chinese.css`
2. 在 `globals.css` 中添加 `@import './fonts-chinese.css';`
3. 在 `src/i18n/routing.ts` 中添加 `'zh'` 到 `locales`
4. 恢复 `messages/zh.json`
5. 恢复 `content/zh/` 目录

---

## ⚠️ 注意事项

### 数据库清理（如果适用）

如果您的项目使用数据库存储多语言内容：

```sql
-- 删除中文内容（示例）
DELETE FROM posts WHERE locale = 'zh';
DELETE FROM pages WHERE locale = 'zh';

-- 或者标记为已删除（软删除）
UPDATE posts SET deleted_at = NOW() WHERE locale = 'zh';
UPDATE pages SET deleted_at = NOW() WHERE locale = 'zh';
```

### SEO 考虑

如果您的网站已经被搜索引擎索引了中文页面：

1. **设置 301 重定向**:
   ```typescript
   // middleware.ts
   if (pathname.startsWith('/zh')) {
     return NextResponse.redirect(new URL('/en', request.url), 301);
   }
   ```

2. **更新 sitemap.xml**:
   - 移除所有 `/zh/*` 路径
   - 只保留 `/en/*` 路径

3. **提交到 Google Search Console**:
   - 提交新的 sitemap
   - 标记中文页面为已删除

---

## 📋 检查清单

移除完成后，请确认以下所有项目：

- [ ] `src/styles/fonts-chinese.css` 已删除
- [ ] `src/app/globals.css` 中无中文字体导入
- [ ] `src/i18n/routing.ts` 中 `locales` 只包含 `['en']`
- [ ] `messages/zh.json` 已删除或备份
- [ ] `content/zh/` 已删除或备份
- [ ] 语言切换器已移除
- [ ] 构建成功（`pnpm build`）
- [ ] 开发服务器正常运行（`pnpm dev`）
- [ ] 英文页面正常访问
- [ ] 中文页面返回 404
- [ ] 无控制台错误或警告
- [ ] 已提交代码到 Git

---

## 🆘 故障排除

### 问题 1: 构建失败

**错误**: `Cannot find module 'messages/zh.json'`

**解决**:
```bash
# 查找所有引用 zh.json 的文件
grep -r "messages/zh" src/

# 移除这些引用
```

### 问题 2: 路由仍然显示 /zh

**解决**:
```bash
# 清理缓存
rm -rf .next
pnpm build
```

### 问题 3: 字体显示异常

**解决**:
```bash
# 检查 globals.css 是否正确
grep -n "font-family" src/app/globals.css

# 确保英文字体配置完整
```

---

## 📞 需要帮助？

如果在移除过程中遇到任何问题：

1. 查看本文档的故障排除部分
2. 检查 Git 历史记录
3. 联系开发团队

---

**文档维护**: 开发团队  
**最后审核**: 2025-11-07

