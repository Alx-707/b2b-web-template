---
paths: "**/*.{test,spec}.{ts,tsx}, tests/**/*"
---

# Testing Standards

## Framework

- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Config**: `vitest.config.mts`

## Commands

```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
pnpm test:e2e          # Playwright E2E tests
pnpm type-check:tests  # Type-check test files
```

## Test File Organization

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       └── __tests__/
│           └── button.test.tsx
└── lib/
    ├── utils.ts
    └── __tests__/
        └── utils.test.ts

tests/
├── e2e/           # Playwright tests
├── integration/   # Cross-module tests
└── unit/          # Isolated unit tests
```

## Test Quality Budgets

| Metric | Limit |
|--------|-------|
| Test function length | ≤ 160 lines (recommended ≤ 100) |
| Cyclomatic complexity | ≤ 20 |
| Parameters | ≤ 5 (relaxed for tests) |

Extract helpers to `__tests__/utils` or `src/test/` when exceeding limits.

## vi.hoisted Usage

**ESM Mock core technique**: `vi.hoisted` declares variables that must exist before module loading.

**Key rule**: `vi.hoisted` callback **cannot reference external imports**, only inline literals.

```typescript
// ❌ Error: referencing external import
import { someHelper } from './helpers';
const mockFn = vi.hoisted(() => {
  return someHelper(); // ESM initialization order error!
});

// ✅ Correct: use inline literals
const mockFn = vi.hoisted(() => vi.fn());
const mockData = vi.hoisted(() => ({
  id: 'test-id',
  name: 'Test Name'
}));

vi.mock('@/lib/api', () => ({
  fetchData: mockFn
}));
```

## Centralized Mock System

**Must use centralized mocks**, no duplicate creation:

| Resource | Path |
|----------|------|
| i18n mock messages | `src/test/constants/mock-messages.ts` |
| Test utilities | `@/test/utils` (`renderWithIntl`, `createMockTranslations`) |
| Mock utilities | `src/test/mock-utils.ts` |

```typescript
// ✅ Correct: use centralized mocks
import { renderWithIntl } from '@/test/utils';
import { mockMessages } from '@/test/constants/mock-messages';

// ❌ Error: duplicate creation
const mockMessages = { ... }; // Forbidden!
function renderWithIntl() { ... } // Forbidden!
```

**Exception**: Local mocks allowed only when testing i18n core config. Must comment reason.

## Writing Tests

### Naming Convention
```typescript
describe('ComponentName', () => {
  it('should [expected behavior] when [condition]', () => {
    // ...
  });
});
```

### Testing Async Server Components
Server Components cannot be rendered directly in Vitest. Test their logic separately:
```typescript
// Test the data fetching function, not the component
import { getAllProductsCached } from '@/lib/content/products';

describe('getAllProductsCached', () => {
  it('should return product list', async () => {
    const products = await getAllProductsCached('en');
    expect(products).toBeDefined();
  });
});
```

### Mocking
- Mock external services (Airtable, Resend) in tests
- Use `vi.mock()` for module mocking
- Translation mocks available in test setup

## Coverage Requirements

- Aim for meaningful coverage, not 100%
- Critical paths: authentication, payment, data validation
- UI components: test user interactions, not implementation details

## Component-Test Sync (Twin File Principle)

When modifying source files, **MUST** follow these steps:

1. **Check**: Does `__tests__/` contain corresponding test file?
2. **Read**: Read the test file to understand current assertions
3. **Sync**: Update test file to reflect changes:
   - DOM structure changes (e.g., `<a>` → `<button>` requires `getByRole` update)
   - API/prop changes
   - New edge cases
4. **Verify**: Run related tests before committing

### Common Sync Issues

| Source Change | Test Update Required |
|---------------|---------------------|
| Element type change (`<a>` → `<button>`) | Update `getByRole()` queries |
| New required props | Update mock data and render calls |
| Interface property added | Update mock configurations |
| Function signature change | Update test assertions |

## Type-Safe Mocking

### Avoid Weak Typing

```typescript
// ❌ Bad: Bypasses type checking
const mockConfig = { enabled: true } as any;

// ❌ Bad: Partial allows missing required fields
const mockConfig: Partial<Config> = { enabled: true };

// ✅ Good: satisfies ensures completeness at compile time
const mockConfig = {
  enabled: true,
  requiredField: 'value',
} satisfies Config;

// ✅ Good: Factory function ensures all fields
const mockConfig = createMockConfig({ enabled: true });
```

### Mock Factory Pattern

For complex config objects, create factory functions in `src/test/factories/`:

```typescript
// src/test/factories/config.factory.ts
export function createMockConfig(overrides?: Partial<Config>): Config {
  return {
    enabled: false,
    requiredField: 'default',
    nested: { prop: 'value' },
    ...overrides,
  };
}
```

**Benefit**: When source interface changes, factory fails first—not at test runtime.

### Unused Variable Convention

When destructuring to exclude properties, prefix with underscore:

```typescript
// ✅ Correct: Underscore prefix for intentionally unused
const { unusedProp: _unusedProp, ...rest } = obj;

// ❌ Wrong: ESLint no-unused-vars error
const { unusedProp, ...rest } = obj;
```

## Pre-commit Test Verification

Before committing, run related tests:

```bash
# Vitest 4: Run tests related to specific files
pnpm vitest related src/path/to/file.tsx --run

# The pre-commit hook runs this automatically for staged source files
```
