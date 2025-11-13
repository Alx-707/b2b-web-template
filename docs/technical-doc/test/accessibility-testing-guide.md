# 无障碍性测试指南

## 📋 概述

本项目使用专门的无障碍性测试页面来确保符合 WCAG 2.1 AA 标准。测试页面仅在开发和测试环境中可用，生产环境不可访问。

---

## 🌍 测试环境

| 环境 | URL | 状态 | 说明 |
|------|-----|------|------|
| **开发环境** | `http://localhost:3000/en/accessibility-test` | ✅ 可访问 | 本地开发测试 |
| **测试环境** | `https://staging.yourdomain.com/en/accessibility-test` | ✅ 可访问 | 预生产验证 |
| **生产环境** | `https://yourdomain.com/en/accessibility-test` | ❌ 404 | 已移除 |

---

## 🔧 测试功能

### **1. 自动化测试**
- 使用 `runAccessibilityTests()` 函数
- 基于 `axe-core` 引擎
- 检测 WCAG 2.1 AA 违规项
- 生成详细的测试报告

### **2. 键盘导航测试**
- Tab 键导航
- Enter/Space 键激活
- Escape 键关闭
- 方向键导航

### **3. 屏幕阅读器测试**
- ARIA 标签验证
- 语义化 HTML 检查
- 焦点管理验证

### **4. 手动测试指南**
- 颜色对比度检查
- 文本缩放测试
- 键盘陷阱检测

---

## 📝 测试流程

### **开发阶段**
```bash
# 1. 启动开发服务器
pnpm dev

# 2. 访问测试页面
open http://localhost:3000/en/accessibility-test

# 3. 运行自动化测试
# 点击页面上的"运行测试"按钮

# 4. 修复发现的问题
# 根据测试报告修复代码

# 5. 重新测试
# 确认所有问题已修复
```

### **提交前验证**
```bash
# 运行完整的测试套件
pnpm test

# 运行无障碍性测试（如果有自动化脚本）
pnpm test:accessibility

# 确认所有测试通过
```

### **部署前验证**
```bash
# 1. 部署到测试环境
pnpm build && pnpm start

# 2. 访问测试环境
open https://staging.yourdomain.com/en/accessibility-test

# 3. 最终验证
# 确认所有无障碍性问题已修复

# 4. 部署到生产环境
# 生产环境不包含测试页面
```

---

## 🚫 生产环境访问控制

### **实现方式**
```typescript
// src/app/[locale]/accessibility-test/page.tsx
export default function AccessibilityTestPage() {
  // 生产环境直接返回 404
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  
  // 开发/测试环境正常显示
  // ...
}
```

### **为什么生产环境不可访问？**
1. ✅ 测试应在部署前完成
2. ✅ 生产环境只提供服务，不是测试环境
3. ✅ 避免暴露技术细节和测试工具
4. ✅ 减少攻击面，提升安全性
5. ✅ 保持专业形象，避免用户困惑

---

## 📊 测试标准

### **WCAG 2.1 AA 合规性**
- **感知性**：内容可被用户感知
- **可操作性**：界面组件可被用户操作
- **可理解性**：信息和操作可被用户理解
- **健壮性**：内容可被各种用户代理解析

### **关键检查项**
- ✅ 所有交互元素可通过键盘访问
- ✅ 焦点顺序符合逻辑
- ✅ ARIA 标签正确使用
- ✅ 颜色对比度符合标准（4.5:1）
- ✅ 表单元素有明确的标签
- ✅ 错误提示清晰可理解
- ✅ 动态内容变化有通知

---

## 🛠️ 常用工具

### **浏览器扩展**
- **axe DevTools**：自动化无障碍性测试
- **WAVE**：可视化无障碍性评估
- **Lighthouse**：综合性能和无障碍性审计

### **屏幕阅读器**
- **NVDA**（Windows）：免费开源
- **JAWS**（Windows）：专业级
- **VoiceOver**（macOS/iOS）：系统内置
- **TalkBack**（Android）：系统内置

### **命令行工具**
```bash
# 使用 Lighthouse CLI
npx lighthouse http://localhost:3000 --only-categories=accessibility

# 使用 axe-core CLI
npx @axe-core/cli http://localhost:3000
```

---

## 📚 参考资源

### **官方文档**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility](https://react.dev/learn/accessibility)

### **测试工具**
- [axe-core](https://github.com/dequelabs/axe-core)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### **最佳实践**
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

---

## 🔄 持续改进

### **定期审计**
- 每次重大功能更新后运行无障碍性测试
- 每季度进行一次全面审计
- 跟踪和修复新发现的问题

### **团队培训**
- 定期组织无障碍性培训
- 分享最佳实践和案例
- 建立无障碍性检查清单

### **用户反馈**
- 收集真实用户的无障碍性反馈
- 优先修复影响用户体验的问题
- 持续优化无障碍性体验

---

## 📞 联系方式

如有无障碍性相关问题，请联系：
- **开发团队**：dev@yourdomain.com
- **无障碍性负责人**：accessibility@yourdomain.com

---

**最后更新**：2025-09-30

