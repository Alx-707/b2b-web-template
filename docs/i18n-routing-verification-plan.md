# 多语言路由验证计划

**日期**: 2025-09-30  
**目的**: 验证 GPT-5 修复后的多语言路由功能  
**修复内容**: 添加 `setRequestLocale(locale)` 和显式传递 `locale` 给 `NextIntlClientProvider`

---

## 测试环境

- **URL**: http://localhost:3000
- **浏览器**: Chrome (通过 Chrome MCP)
- **测试语言**: 英文 (en) 和 中文 (zh)

---

## 测试用例清单

### 1. 基础导航测试 (Basic Navigation)

#### 1.1 英文首页导航
- [ ] 访问 `/en`
- [ ] 点击 "Home" → 验证 URL 为 `/en`
- [ ] 点击 "About" → 验证 URL 为 `/en/about`
- [ ] 点击 "Products" → 验证 URL 为 `/en/products`
- [ ] 点击 "Blog" → 验证 URL 为 `/en/blog`
- [ ] 点击 "Diagnostics" → 验证 URL 为 `/en/diagnostics`

#### 1.2 中文首页导航
- [ ] 访问 `/zh`
- [ ] 点击 "首页" → 验证 URL 为 `/zh`
- [ ] 点击 "关于" → 验证 URL 为 `/zh/about`
- [ ] 点击 "产品" → 验证 URL 为 `/zh/products`
- [ ] 点击 "博客" → 验证 URL 为 `/zh/blog`
- [ ] 点击 "诊断" → 验证 URL 为 `/zh/diagnostics`

---

### 2. 语言切换测试 (Language Switching)

#### 2.1 英文切换到中文
- [ ] 访问 `/en`
- [ ] 点击语言切换器，选择 "中文 (ZH)"
- [ ] 验证 URL 变为 `/zh`
- [ ] 验证页面内容显示中文
- [ ] 验证语言切换器显示 "ZH" 为选中状态

#### 2.2 中文切换到英文
- [ ] 访问 `/zh`
- [ ] 点击语言切换器，选择 "English (EN)"
- [ ] 验证 URL 变为 `/en`
- [ ] 验证页面内容显示英文
- [ ] 验证语言切换器显示 "EN" 为选中状态

---

### 3. 语言切换后导航测试 (Navigation After Language Switch) ⭐ **关键测试**

#### 3.1 英文 → 中文 → 导航
- [ ] 访问 `/en`
- [ ] 切换到中文 → URL 变为 `/zh`
- [ ] 点击 "关于" → 验证 URL 为 `/zh/about` ✅ **修复前会跳转到 `/en/about`**
- [ ] 点击 "产品" → 验证 URL 为 `/zh/products`
- [ ] 点击 "博客" → 验证 URL 为 `/zh/blog`
- [ ] 点击 "首页" → 验证 URL 为 `/zh`

#### 3.2 中文 → 英文 → 导航
- [ ] 访问 `/zh`
- [ ] 切换到英文 → URL 变为 `/en`
- [ ] 点击 "About" → 验证 URL 为 `/en/about`
- [ ] 点击 "Products" → 验证 URL 为 `/en/products`
- [ ] 点击 "Blog" → 验证 URL 为 `/en/blog`
- [ ] 点击 "Home" → 验证 URL 为 `/en`

---

### 4. 次级页面导航测试 (Secondary Page Navigation)

#### 4.1 从 About 页面导航
- [ ] 访问 `/en/about`
- [ ] 点击 "Home" → 验证 URL 为 `/en`
- [ ] 点击 "Products" → 验证 URL 为 `/en/products`
- [ ] 切换到中文 → 验证 URL 为 `/zh/about`
- [ ] 点击 "首页" → 验证 URL 为 `/zh`

#### 4.2 从 Products 页面导航
- [ ] 访问 `/zh/products`
- [ ] 点击 "首页" → 验证 URL 为 `/zh`
- [ ] 点击 "关于" → 验证 URL 为 `/zh/about`
- [ ] 切换到英文 → 验证 URL 为 `/en/products`
- [ ] 点击 "Home" → 验证 URL 为 `/en`

---

### 5. 移动端导航测试 (Mobile Navigation)

#### 5.1 移动端英文导航
- [ ] 调整浏览器窗口到移动端尺寸 (< 768px)
- [ ] 访问 `/en`
- [ ] 点击汉堡菜单图标
- [ ] 点击 "About" → 验证 URL 为 `/en/about`
- [ ] 验证菜单自动关闭

#### 5.2 移动端中文导航
- [ ] 调整浏览器窗口到移动端尺寸
- [ ] 访问 `/zh`
- [ ] 点击汉堡菜单图标
- [ ] 点击 "关于" → 验证 URL 为 `/zh/about`
- [ ] 验证菜单自动关闭

#### 5.3 移动端语言切换后导航
- [ ] 移动端访问 `/en`
- [ ] 切换到中文 → URL 变为 `/zh`
- [ ] 打开汉堡菜单
- [ ] 点击 "关于" → 验证 URL 为 `/zh/about` ✅ **关键测试**

---

### 6. 直接 URL 访问测试 (Direct URL Access)

#### 6.1 英文页面直接访问
- [ ] 直接访问 `/en/about`
- [ ] 验证页面显示英文内容
- [ ] 点击 "Products" → 验证 URL 为 `/en/products`

#### 6.2 中文页面直接访问
- [ ] 直接访问 `/zh/about`
- [ ] 验证页面显示中文内容
- [ ] 点击 "产品" → 验证 URL 为 `/zh/products`

---

### 7. 浏览器前进/后退测试 (Browser Navigation)

#### 7.1 前进/后退保持语言
- [ ] 访问 `/en`
- [ ] 点击 "About" → `/en/about`
- [ ] 点击 "Products" → `/en/products`
- [ ] 点击浏览器后退按钮 → 验证 URL 为 `/en/about`
- [ ] 点击浏览器后退按钮 → 验证 URL 为 `/en`
- [ ] 点击浏览器前进按钮 → 验证 URL 为 `/en/about`

#### 7.2 语言切换后前进/后退
- [ ] 访问 `/en`
- [ ] 切换到中文 → `/zh`
- [ ] 点击 "关于" → `/zh/about`
- [ ] 点击浏览器后退按钮 → 验证 URL 为 `/zh`
- [ ] 点击浏览器前进按钮 → 验证 URL 为 `/zh/about`

---

### 8. 国际化内容验证 (i18n Content Verification)

#### 8.1 翻译键完整性
- [ ] 访问 `/en/about`
- [ ] 验证无 "MISSING_MESSAGE" 错误
- [ ] 验证 "Development Progress" 标题显示正确

#### 8.2 中文翻译键完整性
- [ ] 访问 `/zh/about`
- [ ] 验证无 "MISSING_MESSAGE" 错误
- [ ] 验证 "开发进度" 标题显示正确

---

### 9. Web Vitals 指示器测试 (Performance Indicator)

#### 9.1 英文页面 Web Vitals
- [ ] 访问 `/en`
- [ ] 验证 Web Vitals 指示器显示在左下角
- [ ] 验证显示 CLS, FID, LCP, FCP, TTFB, Score

#### 9.2 中文次级页面 Web Vitals
- [ ] 访问 `/zh/about`
- [ ] 验证 Web Vitals 指示器正常显示 ✅ **修复前可能不显示**
- [ ] 验证所有指标正常更新

---

### 10. 控制台错误检查 (Console Error Check)

#### 10.1 英文页面控制台
- [ ] 访问 `/en`
- [ ] 打开浏览器控制台
- [ ] 验证无 JavaScript 错误
- [ ] 验证无 next-intl 警告

#### 10.2 中文页面控制台
- [ ] 访问 `/zh`
- [ ] 打开浏览器控制台
- [ ] 验证无 JavaScript 错误
- [ ] 验证无 next-intl 警告

#### 10.3 语言切换后控制台
- [ ] 访问 `/en`
- [ ] 切换到中文
- [ ] 点击导航链接
- [ ] 验证无错误或警告

---

## 预期结果

### 修复前的问题
- ❌ 语言切换后导航链接回退到英文 (`/zh` → 点击 About → `/en/about`)
- ❌ 中文次级页面可能无法显示 Web Vitals
- ❌ 可能出现国际化错误

### 修复后的预期
- ✅ 语言切换后导航链接保持当前语言 (`/zh` → 点击 About → `/zh/about`)
- ✅ 所有页面 Web Vitals 正常显示
- ✅ 无国际化错误
- ✅ 所有导航功能正常工作

---

## 测试执行记录

### 执行时间
- **开始时间**: _待填写_
- **结束时间**: _待填写_
- **执行人**: _待填写_

### 测试结果统计
- **总测试用例数**: 60+
- **通过数**: _待填写_
- **失败数**: _待填写_
- **跳过数**: _待填写_
- **通过率**: _待填写_

### 发现的问题
1. _待填写_
2. _待填写_

### 备注
_待填写_

---

## 关键验证点总结

### 🔴 最关键的测试（必须通过）

1. **语言切换后导航保持语言** (测试用例 3.1)
   - `/en` → 切换到中文 → `/zh` → 点击 "关于" → **必须是 `/zh/about`**

2. **移动端语言切换后导航** (测试用例 5.3)
   - 移动端 `/en` → 切换到中文 → 打开菜单 → 点击 "关于" → **必须是 `/zh/about`**

3. **次级页面导航保持语言** (测试用例 4.1, 4.2)
   - `/zh/about` → 点击 "首页" → **必须是 `/zh`**

### 🟡 重要的测试（应该通过）

4. **直接 URL 访问后导航** (测试用例 6)
5. **浏览器前进/后退** (测试用例 7)
6. **国际化内容完整性** (测试用例 8)

### 🟢 次要的测试（建议通过）

7. **Web Vitals 显示** (测试用例 9)
8. **控制台无错误** (测试用例 10)

---

**End of Verification Plan**

