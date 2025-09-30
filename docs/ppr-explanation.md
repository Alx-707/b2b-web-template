# Partial Prerendering (PPR) 详解

**生成时间**: 2025-09-30  
**技术栈**: Next.js 15 + React 19

---

## 📖 什么是 PPR？

**Partial Prerendering (部分预渲染)** 是 Next.js 14 引入的实验性功能，在 Next.js 15 中得到进一步优化。它是一种混合渲染策略，允许在同一个页面中同时使用**静态内容**和**动态内容**。

### 核心概念

PPR 将页面分为两部分：
1. **静态外壳 (Static Shell)**: 在构建时预渲染，可以立即从 CDN 提供
2. **动态内容 (Dynamic Content)**: 在请求时渲染，通过 Streaming 逐步加载

---

## 🎯 PPR 解决的问题

### 传统渲染策略的局限

#### 1. 纯静态生成 (SSG)
```typescript
// 整个页面都是静态的
export default function Page() {
  return <div>Static content</div>
}
```

**问题**: 无法包含用户特定内容（如登录状态、购物车）

#### 2. 纯服务端渲染 (SSR)
```typescript
// 整个页面都是动态的
export default async function Page() {
  const user = await getUser()
  return <div>Hello {user.name}</div>
}
```

**问题**: 每次请求都需要服务器渲染，TTFB 较高，无法利用 CDN 缓存

#### 3. 客户端渲染 (CSR)
```typescript
'use client'
export default function Page() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    fetchUser().then(setUser)
  }, [])
  return <div>Hello {user?.name}</div>
}
```

**问题**: 首屏加载慢，SEO 不友好，需要额外的 JavaScript

### PPR 的解决方案

PPR 允许在同一个页面中混合使用静态和动态内容：

```typescript
// 页面外壳是静态的，用户信息是动态的
export default async function Page() {
  return (
    <div>
      {/* 静态内容 - 构建时预渲染 */}
      <Header />
      <Navigation />
      
      {/* 动态内容 - 请求时渲染 */}
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>
      
      {/* 静态内容 - 构建时预渲染 */}
      <Footer />
    </div>
  )
}
```

---

## 🔧 PPR 工作原理

### 1. 构建时 (Build Time)

Next.js 分析页面，识别静态和动态部分：

```
┌─────────────────────────────────┐
│  Static Shell (预渲染)          │
│  ┌───────────────────────────┐  │
│  │ Header                    │  │
│  │ Navigation                │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │ [Dynamic Hole]            │  │ ← Suspense 边界
│  │ (运行时填充)              │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │ Footer                    │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 2. 请求时 (Request Time)

1. **立即返回静态外壳** (从 CDN)
   - TTFB 极低 (< 50ms)
   - 用户立即看到页面框架

2. **Streaming 动态内容**
   - 服务器渲染动态部分
   - 通过 HTTP Streaming 逐步发送
   - 浏览器逐步填充"洞"

3. **最终页面**
   - 静态 + 动态内容完整呈现
   - 用户体验流畅

---

## 💡 PPR 使用示例

### 示例 1: 电商产品页面

```typescript
// app/products/[id]/page.tsx
import { Suspense } from 'react'

export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* 静态部分 - 构建时预渲染 */}
      <ProductHeader />
      <ProductNavigation />
      
      {/* 动态部分 - 请求时渲染 */}
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails id={params.id} />
      </Suspense>
      
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews id={params.id} />
      </Suspense>
      
      <Suspense fallback={<RecommendationsSkeleton />}>
        <PersonalizedRecommendations userId={getUserId()} />
      </Suspense>
      
      {/* 静态部分 - 构建时预渲染 */}
      <Footer />
    </div>
  )
}

// 动态组件
async function ProductDetails({ id }: { id: string }) {
  const product = await fetchProduct(id) // 动态数据
  return <div>{product.name}</div>
}

async function PersonalizedRecommendations({ userId }: { userId: string }) {
  const recommendations = await fetchRecommendations(userId) // 用户特定数据
  return <div>{/* 推荐列表 */}</div>
}
```

**性能优势**:
- 静态外壳从 CDN 提供，TTFB < 50ms
- 用户立即看到页面框架
- 动态内容逐步加载，不阻塞首屏

### 示例 2: 博客文章页面

```typescript
// app/blog/[slug]/page.tsx
import { Suspense } from 'react'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <article>
      {/* 静态部分 */}
      <BlogHeader />
      
      {/* 文章内容可以是静态的（如果使用 generateStaticParams） */}
      <BlogContent slug={params.slug} />
      
      {/* 动态部分 - 用户特定 */}
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments slug={params.slug} userId={getUserId()} />
      </Suspense>
      
      <Suspense fallback={<RelatedPostsSkeleton />}>
        <RelatedPosts slug={params.slug} />
      </Suspense>
      
      {/* 静态部分 */}
      <Footer />
    </article>
  )
}
```

---

## 🚀 启用 PPR

### 1. 全局启用（实验性）

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // 启用 PPR
  },
}

module.exports = nextConfig
```

### 2. 按路由启用

```typescript
// app/products/[id]/page.tsx
export const experimental_ppr = true // 仅此路由启用 PPR

export default async function ProductPage() {
  // ...
}
```

### 3. 验证 PPR 是否生效

```bash
pnpm build
```

查看构建输出：
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         92.1 kB
├ ○ /about                               4.8 kB         91.7 kB
├ ◐ /products/[id]                       6.1 kB         93.0 kB  ← PPR 启用
└ ○ /blog                                5.5 kB         92.4 kB

○  (Static)   prerendered as static content
◐  (PPR)      prerendered as static HTML with dynamic holes
```

**符号说明**:
- `○` = 完全静态
- `◐` = PPR（部分静态 + 部分动态）
- `λ` = 完全动态 (SSR)

---

## 📊 PPR 性能对比

### 场景: 电商产品页面

| 渲染策略 | TTFB | FCP | LCP | 用户体验 |
|---------|------|-----|-----|---------|
| **纯 SSR** | 500ms | 800ms | 1200ms | 等待时间长 |
| **纯 SSG** | 50ms | 300ms | 500ms | 无法个性化 |
| **CSR** | 50ms | 1500ms | 2000ms | 首屏慢，SEO 差 |
| **PPR** | 50ms | 300ms | 600ms | ✅ 最佳 |

**PPR 优势**:
- TTFB 接近纯静态 (50ms)
- FCP 快速 (300ms)
- LCP 优秀 (600ms)
- 支持个性化内容

---

## ⚠️ PPR 注意事项

### 1. 实验性功能

PPR 在 Next.js 15 中仍是实验性功能，可能存在：
- API 变化
- 性能问题
- 边缘情况 Bug

**建议**: 在非关键路由上试用，生产环境谨慎使用

### 2. Suspense 边界要求

PPR 依赖 React Suspense，必须正确使用：

```typescript
// ✅ 正确
<Suspense fallback={<Skeleton />}>
  <DynamicComponent />
</Suspense>

// ❌ 错误 - 缺少 fallback
<Suspense>
  <DynamicComponent />
</Suspense>
```

### 3. 缓存策略

PPR 的静态外壳可以缓存，但动态内容不能：

```typescript
// 控制缓存行为
export const revalidate = 3600 // 静态外壳 1 小时后重新验证

async function DynamicComponent() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // 动态内容不缓存
  })
  return <div>{data}</div>
}
```

### 4. SEO 考虑

PPR 的静态外壳对 SEO 友好，但动态内容可能不会被爬虫索引：

```typescript
// 确保关键 SEO 内容在静态外壳中
export default async function Page() {
  return (
    <div>
      {/* SEO 关键内容 - 静态 */}
      <h1>Product Title</h1>
      <meta name="description" content="Product description" />
      
      {/* 用户特定内容 - 动态 */}
      <Suspense fallback={<Skeleton />}>
        <UserRecommendations />
      </Suspense>
    </div>
  )
}
```

---

## 🎯 何时使用 PPR？

### ✅ 适合使用 PPR 的场景

1. **电商产品页面**
   - 产品信息静态
   - 用户评论、推荐动态

2. **博客文章页面**
   - 文章内容静态
   - 评论、相关文章动态

3. **仪表板页面**
   - 导航、布局静态
   - 用户数据、图表动态

4. **社交媒体页面**
   - 页面框架静态
   - 用户动态、通知动态

### ❌ 不适合使用 PPR 的场景

1. **完全静态页面**
   - 如营销页面、文档页面
   - 使用纯 SSG 更简单

2. **完全动态页面**
   - 如实时聊天、股票行情
   - 使用纯 SSR 或 CSR 更合适

3. **简单页面**
   - 复杂度不高，PPR 收益有限
   - 增加不必要的复杂性

---

## 📈 PPR 最佳实践

### 1. 合理划分静态/动态边界

```typescript
// ✅ 好的划分
<div>
  <StaticHeader />           {/* 静态 */}
  <Suspense fallback={...}>
    <DynamicUserInfo />      {/* 动态 */}
  </Suspense>
  <StaticFooter />           {/* 静态 */}
</div>

// ❌ 不好的划分 - 过度细分
<div>
  <Suspense fallback={...}>
    <DynamicUserName />      {/* 太小的动态块 */}
  </Suspense>
  <Suspense fallback={...}>
    <DynamicUserAvatar />    {/* 太小的动态块 */}
  </Suspense>
</div>
```

### 2. 提供有意义的 Fallback

```typescript
// ✅ 好的 Fallback - 骨架屏
<Suspense fallback={<UserProfileSkeleton />}>
  <UserProfile />
</Suspense>

// ❌ 不好的 Fallback - 空白或 Loading
<Suspense fallback={<div>Loading...</div>}>
  <UserProfile />
</Suspense>
```

### 3. 监控性能指标

```typescript
// 使用 Web Vitals 监控 PPR 效果
import { onLCP, onFCP, onTTFB } from 'web-vitals'

onLCP(console.log)
onFCP(console.log)
onTTFB(console.log)
```

---

## 🔮 PPR 未来展望

### Next.js 16 计划

- PPR 可能成为稳定功能
- 更好的开发者工具
- 自动优化建议

### React 19 集成

- 更好的 Suspense 支持
- 改进的 Streaming 性能
- 新的并发特性

---

## 📚 总结

### PPR 核心价值

1. **最佳性能**: 结合 SSG 和 SSR 的优势
2. **灵活性**: 同一页面混合静态和动态内容
3. **用户体验**: 快速首屏 + 个性化内容

### 推荐策略

- **当前项目**: 等待 Next.js 16 稳定版
- **试用场景**: 非关键路由（如 /about, /products）
- **生产环境**: 谨慎使用，充分测试

### 下一步

1. 阅读 Next.js 官方文档: https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering
2. 在开发环境试用 PPR
3. 监控性能指标
4. 等待 Next.js 16 稳定版发布

---

**参考资料**:
- [Next.js PPR 文档](https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering)
- [React Suspense 文档](https://react.dev/reference/react/Suspense)
- [Web Vitals](https://web.dev/vitals/)

