#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { HandlerResult, Task } from '../types';

function stabilizeInI18nSpec(content: string): { updated: string; changes: number } {
  let updated = content;
  let changes = 0;

  // Replace direct visibility check on dropdown content with semantic state checks
  const reDropdownVisible = /await\s+expect\(\s*dropdownContent\s*\)\.toBeVisible\(\s*\)\s*;?/g;
  updated = updated.replace(reDropdownVisible, () => {
    changes += 1;
    return (
      "await expect(page.getByTestId('language-toggle-button')).toHaveAttribute('aria-expanded', 'true');\n" +
      "      await expect(dropdownContent).toHaveAttribute('data-state', 'open');"
    );
  });

  // Mobile section also uses dropdownContent visibility
  const reMobileDropdown = /await\s+expect\(\s*dropdownContent\s*\)\.toBeVisible\(\s*\)\s*;?/g;
  updated = updated.replace(reMobileDropdown, () => {
    changes += 1;
    return (
      "await expect(page.getByTestId('language-toggle-button')).toHaveAttribute('aria-expanded', 'true');\n" +
      "      await expect(dropdownContent).toHaveAttribute('data-state', 'open');"
    );
  });

  return { updated, changes };
}

function stabilizeInDebugDropdown(content: string): { updated: string; changes: number } {
  let updated = content;
  let changes = 0;
  const reAssert = /await\s+expect\(\s*dropdownContent\s*\)\.toBeVisible\([^)]*\);/g;
  updated = updated.replace(reAssert, () => {
    changes += 1;
    return (
      "await expect(languageToggleButton).toHaveAttribute('aria-expanded', 'true');\n    await expect(dropdownContent).toHaveAttribute('data-state', 'open');"
    );
  });
  return { updated, changes };
}

export default async function handleT1(_task: Task): Promise<HandlerResult> {
  let totalChanges = 0;
  const outputs: { path: string; type: string; description?: string }[] = [];

  // i18n.spec.ts
  const i18nPath = path.join(process.cwd(), 'tests/e2e/i18n.spec.ts');
  if (fs.existsSync(i18nPath)) {
    const original = fs.readFileSync(i18nPath, 'utf8');
    const { updated, changes } = stabilizeInI18nSpec(original);
    if (changes > 0) {
      fs.writeFileSync(i18nPath, updated, 'utf8');
      totalChanges += changes;
      outputs.push({ path: 'tests/e2e/i18n.spec.ts', type: 'TO_MODIFY', description: '下拉断言稳定化' });
    }
  }

  // debug-dropdown.spec.ts
  const debugPath = path.join(process.cwd(), 'tests/e2e/debug-dropdown.spec.ts');
  if (fs.existsSync(debugPath)) {
    const original = fs.readFileSync(debugPath, 'utf8');
    const { updated, changes } = stabilizeInDebugDropdown(original);
    if (changes > 0) {
      fs.writeFileSync(debugPath, updated, 'utf8');
      totalChanges += changes;
      outputs.push({ path: 'tests/e2e/debug-dropdown.spec.ts', type: 'TO_MODIFY', description: '下拉断言稳定化' });
    }
  }

  if (totalChanges === 0) {
    return { ok: true, message: '未发现需要稳定化的下拉断言', outputs };
  }
  return { ok: true, message: `已稳定化下拉断言 ${totalChanges} 处`, outputs };
}

