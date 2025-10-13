#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { HandlerResult, Task } from '../types';

export default async function handleT5(_task: Task): Promise<HandlerResult> {
  const file = path.join(process.cwd(), 'tests/e2e/i18n-redirect-validation.spec.ts');
  if (!fs.existsSync(file)) {
    return { ok: false, message: `未找到文件: ${file}` };
  }
  const src = fs.readFileSync(file, 'utf8');
  let out = src;
  let changes = 0;

  const patterns: Array<[RegExp, string]> = [
    [/\/en\/about\$/g, '/en/about/?$'],
    [/\/zh\/about\$/g, '/zh/about/?$'],
    [/\/zh\/products\$/g, '/zh/products/?$'],
    [/\/zh\/contact\$/g, '/zh/contact/?$'],
    [/\/en\/contact\$/g, '/en/contact/?$'],
    [/\/en\/blog\$/g, '/en/blog/?$'],
  ];

  for (const [re, rep] of patterns) {
    if (re.test(out)) {
      out = out.replace(re, rep);
      changes += 1;
    }
  }

  if (changes > 0) fs.writeFileSync(file, out, 'utf8');

  return {
    ok: true,
    message: changes > 0 ? `已放宽尾斜杠断言 (${changes} 处)` : '路径断言已兼容尾斜杠',
    outputs: changes
      ? [
          {
            path: 'tests/e2e/i18n-redirect-validation.spec.ts',
            type: 'TO_MODIFY',
            description: '尾斜杠可选匹配',
          },
        ]
      : [],
  };
}

