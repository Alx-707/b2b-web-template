# Contributing to Tucsenberg Web Frontier

感谢您对本项目的关注！我们欢迎各种形式的贡献，包括但不限于功能开发、Bug 修复、文档改进和翻译。

## 开发环境设置

### 前置要求

- **Node.js**: 20.x（使用 `.nvmrc` 指定版本）
- **pnpm**: 10.13.1（使用 `.npmrc` 指定版本）

### 初始化

```bash
# 克隆仓库
git clone <repository-url>
cd tucsenberg-web-frontier

# 切换到正确的 Node 版本（如使用 nvm）
nvm use

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 代码规范

### TypeScript 严格模式

- **禁止使用 `any` 类型**：使用具体类型或 `unknown`
- **优先使用 `interface`**：而非 `type`（除联合类型外）
- **启用所有严格检查**：`strict: true` in tsconfig.json

### 组件规范

- **Server Components 优先**：仅在需要交互时使用 `"use client"`
- **文件大小限制**：单文件不超过 500 行
- **函数复杂度**：单函数不超过 120 行

### 国际化要求

- **所有用户可见文本必须使用翻译键**
- 翻译文件位于 `messages/[locale]/`
- 首屏内容放入 `critical.json`，其他放入 `deferred.json`

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `ContactForm.tsx` |
| 工具文件 | kebab-case | `form-helpers.ts` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_ITEMS` |
| 类型/接口 | PascalCase | `UserProfile` |
| 函数/变量 | camelCase | `getUserData` |

### 导入顺序

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 第三方库
import { z } from 'zod';

// 3. 内部模块（绝对路径）
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 4. 类型导入
import type { User } from '@/types';
```

## 提交规范

### Commit Message 格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### 类型 (type)

| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具变更 |
| `ci` | CI 配置变更 |

### 示例

```bash
feat(products): add product inquiry form
fix(i18n): resolve missing translation keys for FAQ page
docs(readme): update content management section
refactor(contact): simplify form validation logic
```

## 提交 PR 前检查清单

在提交 Pull Request 之前，请确保：

### 代码质量

```bash
# 类型检查
pnpm type-check

# ESLint 检查
pnpm lint:check

# 格式化检查
pnpm format:check

# 运行测试
pnpm test
```

### 安全检查

```bash
# 依赖安全审计 + Semgrep 扫描
pnpm security:check
```

### 翻译完整性

```bash
# 确保英中翻译键一致
pnpm validate:translations
```

### 综合质量关卡

```bash
# 一次性运行所有检查
pnpm quality:gate
```

## Pull Request 流程

### 1. 创建分支

```bash
git checkout -b feat/your-feature-name
# 或
git checkout -b fix/issue-description
```

### 2. 开发和测试

- 遵循上述代码规范
- 为新功能编写测试
- 确保所有测试通过

### 3. 提交代码

```bash
git add .
git commit -m "feat(scope): description"
```

### 4. 推送并创建 PR

```bash
git push origin feat/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

### PR 描述模板

```markdown
## 变更描述

简要描述本次变更的内容和目的。

## 变更类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 测试相关
- [ ] 其他

## 测试说明

描述如何测试这些变更。

## 检查清单

- [ ] 代码遵循项目规范
- [ ] 已添加必要的测试
- [ ] 所有测试通过
- [ ] 已更新相关文档
- [ ] 翻译键完整（如涉及 UI 文本）
```

## 内容贡献

### 添加新产品

1. 在 `content/products/en/` 和 `content/products/zh/` 分别创建同名文件
2. 使用相同的 `slug` 确保 i18n 路由正确
3. 填写完整的 frontmatter 字段（参见 README.md）

### 添加博客文章

1. 在 `content/posts/en/` 和 `content/posts/zh/` 创建文章
2. 确保英中版本使用相同的 `slug`
3. 设置正确的 `publishedAt` 日期

### 添加翻译

1. 在 `messages/en/` 和 `messages/zh/` 的对应文件中添加翻译键
2. 运行 `pnpm validate:translations` 确保两种语言的键一致
3. 首屏内容放 `critical.json`，其他放 `deferred.json`

## 问题反馈

如果您发现 Bug 或有功能建议，请：

1. 先搜索现有 Issues 避免重复
2. 使用 Issue 模板创建新 Issue
3. 提供尽可能详细的复现步骤或需求描述

## 行为准则

参与本项目意味着您同意遵守以下准则：

- 尊重所有贡献者
- 使用友善和包容的语言
- 接受建设性批评
- 关注项目和社区的最佳利益

## 许可证

通过贡献代码，您同意您的贡献将在 MIT 许可证下发布。

---

感谢您的贡献！如有任何问题，欢迎在 Issues 中讨论。
