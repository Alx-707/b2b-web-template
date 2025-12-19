# Tasks: Fix Navbar Responsive Overlap

## 1. Layout Restructure

- [ ] 1.1 Update left section container in `header.tsx` to use `shrink-0` (remove any fixed width)
- [ ] 1.2 Update right section container in `header.tsx` to use `shrink-0 justify-end`
- [ ] 1.3 Modify `CenterNav` component to use `flex-1 min-w-0 justify-center` instead of absolute positioning

## 2. Breakpoint Synchronization (Critical)

- [ ] 2.1 Change desktop navigation visibility from `md:flex` to `lg:flex` in `vercel-navigation.tsx`
- [ ] 2.2 **MUST** Change mobile menu button from `md:hidden` to `lg:hidden` in `mobile-navigation.tsx`
- [ ] 2.3 (Optional) Evaluate CTA button breakpoint - consider changing from `md:inline-flex` to `lg:inline-flex`

## 3. Test Updates

- [ ] 3.1 Update `vercel-navigation.test.tsx` to expect `lg:flex` instead of `md:flex`
- [ ] 3.2 Update `mobile-navigation-*.test.tsx` to expect `lg:hidden` instead of `md:hidden`
- [ ] 3.3 Update `nav-switcher.test.tsx` if it references breakpoint classes

## 4. Verification

- [ ] 4.1 Run `pnpm type-check` to verify no TypeScript errors
- [ ] 4.2 Run `pnpm lint:check` to verify ESLint compliance
- [ ] 4.3 Run `pnpm test` to verify all unit tests pass
- [ ] 4.4 Run `pnpm build` to verify production build succeeds

## 5. Manual Testing (Critical Viewports)

- [ ] 5.1 Test at 768px: Mobile menu button visible, desktop nav hidden
- [ ] 5.2 Test at 820px: Mobile menu button visible, desktop nav hidden
- [ ] 5.3 Test at 900px: Mobile menu button visible, desktop nav hidden
- [ ] 5.4 Test at 1024px: Desktop nav visible, mobile menu hidden
- [ ] 5.5 Test at 1280px: Desktop nav visible, no overlap
- [ ] 5.6 Test at 1920px: Desktop nav visible, properly centered

## 6. Dropdown Menu Verification

- [ ] 6.1 At >= 1024px, open Products dropdown - verify not clipped
- [ ] 6.2 Dropdown fully visible and clickable
- [ ] 6.3 Dropdown layered correctly (above header content)

## 7. Additional Checks

- [ ] 7.1 Logo remains fully visible during resize
- [ ] 7.2 Language toggle accessible at all breakpoints
- [ ] 7.3 Dark mode appearance unchanged
- [ ] 7.4 Mobile menu opens and closes correctly at < 1024px

## 8. Documentation

- [ ] 8.1 Update this tasks.md with completion status
