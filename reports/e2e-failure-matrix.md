# E2E 失败矩阵

生成时间: 2025-10-12T15:01:30.694Z

| 项目(Project) | Spec 文件 | 测试标题 | 失败类型 | 嫌疑 Flake | 示例信息 |
|---|---|---|---|---|---|
| chromium | firefox-diagnosis.spec.ts | Diagnosis 1: router.refresh() timing analysis | 脚本/其他 |  | Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m |
| webkit | i18n-redirect-validation.spec.ts | 语言切换应该保持在相同的页面类型 | 脚本/其他 |  | Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoMatch[2m([22m[32mexpected[39m[2m)[22m |
| Mobile Chrome | i18n.spec.ts | should default to English locale and display correct lang attribute | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Safari | i18n.spec.ts | should default to English locale and display correct lang attribute | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| chromium | i18n.spec.ts | should preserve current page path during language switch | 等待/超时 |  | TimeoutError: page.waitForFunction: Timeout 5000ms exceeded. |
| webkit | i18n.spec.ts | should preserve current page path during language switch | 等待/超时 |  | TimeoutError: page.waitForFunction: Timeout 5000ms exceeded. |
| Mobile Chrome | i18n.spec.ts | should switch from English to Chinese and update content | 等待/超时 |  | TimeoutError: page.waitForFunction: Timeout 10000ms exceeded. |
| Mobile Chrome | i18n.spec.ts | should switch from Chinese back to English | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Chrome | i18n.spec.ts | should preserve current page path during language switch | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Safari | i18n.spec.ts | should switch from English to Chinese and update content | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Safari | i18n.spec.ts | should switch from Chinese back to English | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Safari | i18n.spec.ts | should preserve current page path during language switch | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Chrome | i18n.spec.ts | should display all navigation items in both languages | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Safari | i18n.spec.ts | should display all navigation items in both languages | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| chromium | i18n.spec.ts | should pass accessibility checks in both languages | a11y |  | AssertionError: 1 accessibility violation was detected |
| chromium | i18n.spec.ts | should have proper lang attributes for screen readers | 脚本/其他 |  | Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m |
| webkit | i18n.spec.ts | should pass accessibility checks in both languages | a11y |  | AssertionError: 1 accessibility violation was detected |
| Mobile Chrome | i18n.spec.ts | should pass accessibility checks in both languages | a11y |  | AssertionError: 1 accessibility violation was detected |
| Mobile Chrome | i18n.spec.ts | should generate correct URLs for different locales | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Safari | i18n.spec.ts | should generate correct URLs for different locales | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| firefox | navigation.spec.ts | should redirect root path to default locale | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Chrome | navigation.spec.ts | should display all main navigation links | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Chrome | navigation.spec.ts | should navigate between pages and highlight active link | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Chrome | navigation.spec.ts | should support keyboard navigation | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Safari | navigation.spec.ts | should display all main navigation links | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Safari | navigation.spec.ts | should navigate between pages and highlight active link | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Safari | navigation.spec.ts | should support keyboard navigation | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Chrome | navigation.spec.ts | should preserve query parameters during navigation | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Chrome | navigation.spec.ts | should handle browser back/forward navigation | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Safari | navigation.spec.ts | should preserve query parameters during navigation | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Safari | navigation.spec.ts | should handle browser back/forward navigation | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Chrome | navigation.spec.ts | should have proper ARIA attributes | 脚本/其他 |  | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveAttribute[2m([22m[32mexpected[39m[2m)[22m failed |
| Mobile Chrome | navigation.spec.ts | should support screen reader navigation | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Chrome | navigation.spec.ts | should work with high contrast mode | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Safari | navigation.spec.ts | should have proper ARIA attributes | 脚本/其他 |  | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveAttribute[2m([22m[32mexpected[39m[2m)[22m failed |
| Mobile Safari | navigation.spec.ts | should support screen reader navigation | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Safari | navigation.spec.ts | should work with high contrast mode | 可见性/Portal/动画 | ✅ | Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed |
| Mobile Chrome | navigation.spec.ts | should navigate quickly between pages | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |
| Mobile Safari | navigation.spec.ts | should navigate quickly between pages | 等待/超时 |  | [31mTest timeout of 30000ms exceeded.[39m |

## 按项目统计

| 项目 | 失败数 |
|---|---|
| chromium | 4 |
| webkit | 3 |
| Mobile Chrome | 16 |
| Mobile Safari | 15 |
| firefox | 1 |
