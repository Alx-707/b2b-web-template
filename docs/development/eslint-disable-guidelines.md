# ESLint 禁用注释使用准则

## 概述

本文档规定了在项目中使用 ESLint 禁用注释的准则，确保代码质量的同时避免滥用。

## 允许使用的场景

### 1. API 类型定义文件 ✅

**适用文件类型**：
- `src/types/whatsapp-*.ts` - WhatsApp API 相关类型定义
- `src/types/*-api-*.ts` - 其他 API 类型定义文件
- `src/types/*-types.ts` - 完整的外部服务类型定义

**使用规则**：
```typescript
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * [服务名] 完整类型定义文件
 * 
 * 说明：此文件包含完整的 [服务名] 类型定义，用于保持与官方API的一致性。
 * 某些类型可能暂时未使用，但保留以备将来功能扩展时使用。
 * 
 * ESLint禁用原因：API类型定义的完整性比当前使用状态更重要
 * 审查周期：每季度审查一次，评估是否有类型可以移除或需要新增
 */
```

### 2. 开发工具文件 ✅

**适用文件类型**：
- `src/components/dev-tools/**/*.ts(x)` - 开发工具组件
- `scripts/**/*.js` - 构建和开发脚本
- `tests/**/*.ts` - 测试文件（特定情况下）

**使用规则**：
- 仅禁用 `no-console` 规则
- 必须添加说明注释

### 3. 测试文件 ⚠️

**限制使用**：
- 仅在必要时使用
- 优先修复问题而非禁用规则
- 必须添加详细说明

## 禁止使用的场景

### 1. 业务逻辑代码 ❌
- `src/components/**/*.ts(x)` (除 dev-tools 外)
- `src/lib/**/*.ts`
- `src/app/**/*.ts(x)`
- `src/hooks/**/*.ts`

### 2. 配置文件 ❌
- `next.config.js`
- `tailwind.config.js`
- 其他配置文件

## 审查机制

### 季度审查
每季度进行一次全面审查：

1. **检查命令**：
```bash
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "eslint-disable"
```

2. **审查清单**：
- [ ] 禁用注释是否仍然必要？
- [ ] 是否可以通过修复代码来移除禁用？
- [ ] 禁用的规则是否过于宽泛？
- [ ] 是否有新的类型需要添加？

### 自动化监控

在 CI/CD 中添加检查：

```bash
# 检查是否有新的禁用注释在不允许的目录中
if find src/components src/lib src/app src/hooks -name "*.ts" -o -name "*.tsx" | xargs grep -l "eslint-disable" | grep -v "dev-tools"; then
  echo "❌ 发现在业务逻辑代码中使用 ESLint 禁用注释"
  exit 1
fi
```

## 最佳实践

### 1. 优先修复而非禁用
- 首先尝试修复 ESLint 错误
- 只有在技术上不可行时才考虑禁用

### 2. 精确禁用
- 使用具体的规则名而非通用禁用
- 尽可能缩小禁用范围

### 3. 文档化
- 必须添加说明注释
- 说明禁用的原因和审查周期

### 4. 定期清理
- 定期审查是否还需要禁用
- 及时移除不再需要的禁用注释

## 违规处理

### 代码审查阶段
- 审查者必须质疑任何新的 ESLint 禁用注释
- 要求提供充分的理由和文档

### CI/CD 阶段
- 自动检查禁用注释的使用
- 阻止在不允许的位置使用禁用注释

## 更新记录

- 2024-01-XX: 初始版本，建立基本准则
- 下次审查时间: 2024-04-XX
