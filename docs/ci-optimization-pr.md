# CI/CD 优化：分层缓存策略与并发控制修复

## 📋 变更摘要

本 PR 优化了 CI/CD 流水线的缓存策略和并发控制，预计可节省 **8-15 分钟/次**的 CI 运行时间，并提升 **10-20%** 的整体效率。

## 🎯 主要改动

### 1. 修复并发控制 ✅ P0
**问题**：并发组包含 `github.sha`，导致每次提交都创建新的并发组，无法取消同分支的旧运行。

**修复**：
```yaml
# 修改前
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}-${{ github.sha }}
  cancel-in-progress: true

# 修改后
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**收益**：新推送会自动取消同分支上旧的 CI 运行，节省 5-10 分钟/次。

---

### 2. 移除 E2E 重复构建 ✅ P0
**问题**：E2E 作业先执行 `pnpm build`，然后 Playwright 的 `webServer` 又执行 `pnpm build && pnpm start`，导致构建两次。

**修复**：移除 E2E 作业中的显式构建步骤，让 Playwright 的 `webServer` 统一负责构建和启动。

**收益**：节省 3-5 分钟/次。

---

### 3. 分层缓存策略 ✅ P1

#### 3.1 依赖缓存（pnpm store）
**应用于**：所有 7 个作业（basic-checks, tests, e2e-tests, performance, security, translation-quality, architecture）

**策略**：
```yaml
- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-node20-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-node20-pnpm-
```

**特点**：
- 只缓存 `~/.pnpm-store`（移除了 `node_modules`）
- 只用 lockfile hash（最大化命中率）
- 不受源码变更影响

#### 3.2 构建缓存（Next.js）
**应用于**：e2e-tests, performance

**策略**：
```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: ${{ runner.os }}-next-cache-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('next.config.*', 'tsconfig*.json', 'tailwind.config.js', 'postcss.config.*', 'src/**/*.{ts,tsx,js,jsx,css,scss,mdx}') }}
    restore-keys: |
      ${{ runner.os }}-next-cache-${{ hashFiles('**/pnpm-lock.yaml') }}-
```

**特点**：
- 绑定源码和配置文件（合理失效）
- 跨提交复用（不使用 github.sha）
- 只在构建输入真正变化时失效

#### 3.3 测试缓存（Vitest）
**应用于**：tests

**策略**：
```yaml
- name: Cache Vitest
  uses: actions/cache@v4
  with:
    path: .vitest/cache
    key: ${{ runner.os }}-vitest-cache-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('vitest.config.*', 'tsconfig*.json', 'src/**/*.{ts,tsx,js,jsx}', 'tests/**/*.{ts,tsx,js,jsx}') }}
    restore-keys: |
      ${{ runner.os }}-vitest-cache-${{ hashFiles('**/pnpm-lock.yaml') }}-
```

**特点**：
- 绑定测试配置和源码
- 显著减少二次运行的编译时间

---

## 📊 预期收益

| 优化项 | 节省时间 | 提升效率 |
|--------|---------|---------|
| 并发控制修复 | 5-10 分钟/次 | 避免重复运行 |
| E2E 去重构建 | 3-5 分钟/次 | 减少冗余工作 |
| 统一缓存策略 | 1-2 分钟/作业 | 提升 10-20% |
| **总计** | **8-15 分钟/次** | **显著提升** |

---

## 🔍 技术细节

### 为什么不缓存 node_modules？
pnpm 使用内容寻址和符号链接，缓存 `node_modules` 不仅体积巨大、命中概率低，还容易产生路径/链接问题。只缓存 `~/.pnpm-store` 更高效。

### 为什么构建缓存使用源码 hash？
- **不使用 github.sha**：会导致每次提交必失效
- **使用源码 hash**：可以跨提交复用，只在构建输入真正变化时失效
- **多级 restore-keys**：即使完全匹配失败，也能部分复用

### 为什么保持 Playwright 超时 180s？
180 秒是保守而稳定的选择，能覆盖冷启动和 CI 较慢机时延迟。直接降到 120s 有增加 flaky 风险。

---

## ✅ 验证清单

- [x] 并发控制修复（移除 github.sha）
- [x] E2E 重复构建移除
- [x] basic-checks 缓存优化
- [x] tests 作业添加缓存（pnpm + vitest）
- [x] e2e-tests 作业添加缓存（pnpm + next）
- [x] performance 作业添加缓存（pnpm + next）
- [x] security 作业添加缓存（pnpm）
- [x] translation-quality 作业添加缓存（pnpm）
- [x] architecture 作业添加缓存（pnpm）
- [x] 移除所有 node_modules 缓存
- [x] Playwright 超时保持 180s
- [x] LHCI 配置保持不变

---

## 🚀 后续优化建议

### 可选优化（P2）
1. **Playwright 超时调整**：如果 CI 日志显示从未慢启动，可以降低到 150s
2. **差异覆盖率检查**：仅针对变更文件检查覆盖率，持续提升质量

### 监控指标
- CI 运行时间趋势
- 缓存命中率
- 作业并发取消次数

---

## 📚 参考资料

- [GitHub Actions 缓存最佳实践](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [pnpm 缓存策略](https://pnpm.io/continuous-integration#github-actions)
- [Next.js 构建缓存](https://nextjs.org/docs/pages/building-your-application/deploying/ci-build-caching)

---

## 🙏 致谢

感谢 GPT-5 提供的专业审计和优化建议。

