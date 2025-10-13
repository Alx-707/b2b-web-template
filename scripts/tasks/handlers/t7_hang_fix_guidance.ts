#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { HandlerResult, Task } from '../types';

export default async function handleT7(_task: Task): Promise<HandlerResult> {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkg.scripts = pkg.scripts || {};
  let changes = 0;
  if (!pkg.scripts['test:e2e:no-reuse']) {
    pkg.scripts['test:e2e:no-reuse'] = 'CI=1 pnpm test:e2e';
    changes += 1;
  }
  if (!pkg.scripts['test:e2e:ci-local']) {
    pkg.scripts['test:e2e:ci-local'] = 'CI=1 pnpm test:e2e';
    changes += 1;
  }

  if (changes > 0) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }

  return {
    ok: true,
    message: changes > 0 ? '已新增避免挂起的本地运行脚本' : '运行脚本已存在，无需修改',
    outputs: changes
      ? [
          { path: 'package.json', type: 'TO_MODIFY', description: '新增 test:e2e:no-reuse 与 test:e2e:ci-local' },
        ]
      : [],
  };
}

