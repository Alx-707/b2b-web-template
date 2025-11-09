## Testing Idle & Client Islands

为了在 jsdom 测试环境稳定地覆盖依赖 Idle/IntersectionObserver 的客户端小岛（Client Islands），我们提供了两项测试级工具：

- 来自 `src/test/setup.ts` 的可见性触发辅助：`triggerVisible(el)` 与 `triggerAll()`
- i18n 渲染助手：`renderWithI18nAndLocale(ui, { locale, messages })`

### 可见性触发（IntersectionObserver）

`src/test/setup.ts` 中实现了可控的 `IntersectionObserver` Mock：

- 默认策略为 `autoVisibleAll=true`，在 `observe()` 时直接触发回调，使懒加载/Idle 组件在测试中立即可见
- 提供导出函数：
  - `triggerVisible(el)`: 对单个元素触发 `isIntersecting=true`
  - `triggerAll()`: 对所有被观察的元素触发可见

示例：

<augment_code_snippet mode="EXCERPT">
````ts
render(<Header />);
await (await import('@/test/setup')).triggerAll();
````
</augment_code_snippet>

### i18n 渲染助手

使用 `src/test/render-with-i18n.tsx` 提供的 `renderWithI18nAndLocale` 包裹被测组件，注入最小 `messages` 与 `locale`：

<augment_code_snippet path="src/test/render-with-i18n.tsx" mode="EXCERPT">
````tsx
export function renderWithI18nAndLocale(ui, { locale='en', messages=fixture } = {}) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>{ui}</NextIntlClientProvider>
  );
}
````
</augment_code_snippet>

建议优先使用语义化查询（`getByRole`/`getByText`）并仅在必要处保留 `data-testid`。
