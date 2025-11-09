# 翻译定制指南 / Translation Customization Guide

本项目使用分层翻译架构，将翻译文件拆分为**首屏必需**（critical）和**延迟加载**（deferred）两部分，既优化了性能，又便于企业快速定制。

This project uses a layered translation architecture, splitting translation files into **critical** (first-screen) and **deferred** (lazy-loaded) parts for both performance optimization and easy customization.

---

## 📁 文件结构 / File Structure

```
messages/
├── en/
│   ├── critical.json    # 首屏必需翻译（Header、Footer、Hero）
│   └── deferred.json    # 延迟加载翻译（其他所有内容）
└── zh/
    ├── critical.json    # First-screen required translations
    └── deferred.json    # Lazy-loaded translations
```

### critical.json（约 101 个 key，18.4%）

包含首屏渲染必需的翻译：
- **Hero 区域**：`home.hero.*`
- **导航菜单**：`navigation.*`
- **主题切换**：`theme.*`
- **语言切换**：`language.*`
- **页脚**：`footer.sections.*`
- **SEO**：`seo.siteName`
- **通用**：`common.loading`, `common.error`
- **无障碍**：`accessibility.*`

### deferred.json（约 449 个 key，81.6%）

包含延迟加载的翻译：
- **技术栈展示**：`home.techStack.*`
- **组件展示**：`home.showcase.*`
- **项目概述**：`home.overview.*`
- **行动号召**：`home.cta.*`
- **联系表单**：`contact.*`
- **其他页面**：所有其他命名空间

---

## 🚀 快速开始 / Quick Start

### 1. 修改品牌信息 / Modify Brand Information

**文件**：`messages/en/critical.json` 和 `messages/zh/critical.json`

```json
{
  "home": {
    "hero": {
      "title": {
        "line1": "Your Company Name",    // ← 修改公司名称
        "line2": "Professional Slogan"   // ← 修改 Slogan
      },
      "subtitle": "Your company description here"  // ← 修改描述
    }
  },
  "seo": {
    "siteName": "Your Company"  // ← 修改站点名称（用于 SEO 和 Logo）
  }
}
```

### 2. 修改导航菜单 / Modify Navigation Menu

**文件**：`messages/en/critical.json` 和 `messages/zh/critical.json`

```json
{
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact",
    "services": "Services",    // ← 修改或添加导航项
    "products": "Products",
    // ... 其他导航项
  }
}
```

### 3. 修改页脚链接 / Modify Footer Links

**文件**：`messages/en/critical.json` 和 `messages/zh/critical.json`

```json
{
  "footer": {
    "sections": {
      "product": {
        "title": "Product",
        "home": "Home",
        "enterprise": "Enterprise",
        "pricing": "Pricing"
      },
      "company": {
        "title": "Company",
        "terms": "Terms of Service",    // ← 修改链接文本
        "privacy": "Privacy Policy",
        "aiPolicy": "AI Policy"
      },
      // ... 其他页脚部分
    }
  }
}
```

### 4. 修改联系方式 / Modify Contact Information

**文件**：`messages/en/deferred.json` 和 `messages/zh/deferred.json`

```json
{
  "contact": {
    "title": "Contact Us",
    "description": "Get in touch with our team",
    "form": {
      "name": "Name",
      "email": "Email",
      "message": "Message",
      "submit": "Send Message"
    },
    "info": {
      "email": "contact@yourcompany.com",    // ← 修改联系邮箱
      "phone": "+1 (555) 123-4567",          // ← 修改联系电话
      "address": "Your Company Address"       // ← 修改地址
    }
  }
}
```

---

## ✅ 验证翻译 / Validate Translations

运行验证脚本确保翻译完整性：

```bash
npm run validate:translations
```

或手动运行：

```bash
node scripts/validate-translations.js
```

验证脚本会检查：
- ✅ critical.json 和 deferred.json 是否包含所有必需的 key
- ✅ 两个文件没有重复的 key
- ✅ 所有 locale（en、zh）的翻译结构一致

---

## 🔧 高级定制 / Advanced Customization

### 添加新的翻译 key

1. **首屏必需的翻译**：添加到 `critical.json`
   - 例如：新的导航项、页脚链接

2. **延迟加载的翻译**：添加到 `deferred.json`
   - 例如：新的页面内容、功能模块

### 重新拆分翻译文件

如果您修改了原始的 `messages/en.json` 或 `messages/zh.json`，可以重新运行拆分脚本：

```bash
npm run split:translations
```

或手动运行：

```bash
node scripts/split-translations.js
```

**注意**：这会覆盖现有的 `critical.json` 和 `deferred.json`，请确保已备份您的修改。

---

## 📝 常见问题 / FAQ

### Q1: 如何知道某个翻译 key 在哪个文件中？

**A**: 使用 IDE 的全局搜索功能（Ctrl/Cmd + Shift + F）在 `messages/` 目录中搜索 key 名称。

### Q2: 修改翻译后需要重启开发服务器吗？

**A**: 是的，翻译文件是静态导入的，修改后需要重启 `npm run dev`。

### Q3: 如何添加新的语言？

**A**: 
1. 创建 `messages/[new-locale]/critical.json` 和 `deferred.json`
2. 在 `src/i18n/routing.ts` 中添加新的 locale
3. 更新 `src/app/[locale]/layout.tsx` 和 `page.tsx` 的 import 语句

### Q4: critical.json 和 deferred.json 的划分标准是什么？

**A**: 
- **critical.json**：首屏渲染时立即需要的翻译（Header、Footer、Hero）
- **deferred.json**：首屏视口之外的内容（below-the-fold）

### Q5: 如何验证翻译文件的完整性？

**A**: 运行 `npm run validate:translations`，脚本会检查：
- 所有必需的 key 是否存在
- 是否有重复的 key
- 所有 locale 的结构是否一致

---

## 🎯 最佳实践 / Best Practices

1. **保持 critical.json 最小化**
   - 只包含首屏必需的翻译
   - 避免添加不必要的 key

2. **使用一致的命名规范**
   - 使用点号分隔的命名空间（例如：`home.hero.title`）
   - 保持所有 locale 的 key 结构一致

3. **定期验证翻译**
   - 每次修改后运行验证脚本
   - 确保所有 locale 的翻译同步更新

4. **备份原始文件**
   - 在重新拆分前备份 `critical.json` 和 `deferred.json`
   - 使用版本控制（Git）跟踪所有修改

---

## 📚 相关文档 / Related Documentation

- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [项目 README](../README.md)

---

## 💡 需要帮助？ / Need Help?

如果您在定制翻译时遇到问题，请：
1. 检查控制台是否有错误信息
2. 运行 `npm run validate:translations` 验证翻译完整性
3. 查看 [项目文档](../README.md) 或提交 Issue

---

**最后更新**：2025-01-07

