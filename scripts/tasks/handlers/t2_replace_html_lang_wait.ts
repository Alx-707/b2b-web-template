#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { HandlerResult, Task } from '../types';

function replaceLangWaits(content: string): { updated: string; count: number } {
  let updated = content;
  let count = 0;

  // Pattern 1: await page.waitForFunction((expectedLang) => document.documentElement.lang === expectedLang, 'zh', { ... });
  const pattern = /await\s+page\.waitForFunction\(\s*\(expectedLang\)\s*=>\s*document\.documentElement\.lang\s*===\s*expectedLang\s*,\s*(['"])(zh|en)\1\s*,[\s\S]*?\);/g;
  updated = updated.replace(pattern, (_m, _q, lang) => {
    count += 1;
    return `await expect(page.locator('html')).toHaveAttribute('lang', '${lang}');`;
  });

  // Pattern 2: shorter variant without options
  const pattern2 = /await\s+page\.waitForFunction\(\s*\(expectedLang\)\s*=>\s*document\.documentElement\.lang\s*===\s*expectedLang\s*,\s*(['"])(zh|en)\1\s*\);/g;
  updated = updated.replace(pattern2, (_m, _q, lang) => {
    count += 1;
    return `await expect(page.locator('html')).toHaveAttribute('lang', '${lang}');`;
  });

  return { updated, count };
}

export default async function handleT2(_task: Task): Promise<HandlerResult> {
  const target = path.join(process.cwd(), 'tests/e2e/i18n.spec.ts');
  if (!fs.existsSync(target)) {
    return { ok: false, message: `未找到文件: ${target}` };
  }
  const original = fs.readFileSync(target, 'utf8');
  const { updated, count } = replaceLangWaits(original);

  if (count === 0) {
    return { ok: true, message: '未发现需要替换的 html[lang] 等待语句', outputs: [] };
  }

  fs.writeFileSync(target, updated, 'utf8');
  return {
    ok: true,
    message: `已替换 ${count} 处 html[lang] 自定义等待为 toHaveAttribute`,
    outputs: [{ path: 'tests/e2e/i18n.spec.ts', type: 'TO_MODIFY', description: '替换 html[lang] 等待' }],
  };
}
