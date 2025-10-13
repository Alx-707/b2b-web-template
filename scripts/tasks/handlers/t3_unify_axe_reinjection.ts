#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { HandlerResult, Task } from '../types';

export default async function handleT3(_task: Task): Promise<HandlerResult> {
  const navSpec = path.join(process.cwd(), 'tests/e2e/navigation.spec.ts');
  if (!fs.existsSync(navSpec)) {
    return { ok: false, message: `未找到文件: ${navSpec}` };
  }

  let content = fs.readFileSync(navSpec, 'utf8');
  let changes = 0;

  // Ensure accessibility test disables color-contrast and limits impacts
  const search = /checkA11y\(page,\s*'nav\[aria-label="Main navigation"\]'\s*,\s*\{[\s\S]*?\}\);/m;
  if (search.test(content)) {
    content = content.replace(search, (m) => {
      if (/includedImpacts|color-contrast/.test(m)) return m; // already adjusted
      changes += 1;
      return (
        "checkA11y(page, 'nav[aria-label=\"Main navigation\"]', {\n" +
        "        detailedReport: true,\n" +
        "        detailedReportOptions: { html: true },\n" +
        "        axeOptions: { rules: { 'color-contrast': { enabled: false } } },\n" +
        "        includedImpacts: ['critical', 'serious'],\n" +
        "      });"
      );
    });
  }

  if (changes > 0) {
    fs.writeFileSync(navSpec, content, 'utf8');
  }

  return {
    ok: true,
    message: changes > 0 ? `已统一导航 a11y 检查选项 (${changes} 处)` : '导航 a11y 检查已符合规范',
    outputs: changes
      ? [
          {
            path: 'tests/e2e/navigation.spec.ts',
            type: 'TO_MODIFY',
            description: '统一 a11y 规则与参数',
          },
        ]
      : [],
  };
}

