#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { HandlerResult, Task } from '../types';

export default async function handleT9(_task: Task): Promise<HandlerResult> {
  const cfgPath = path.join(process.cwd(), 'playwright.config.ts');
  if (!fs.existsSync(cfgPath)) {
    return { ok: false, message: `未找到配置: ${cfgPath}` };
  }
  let content = fs.readFileSync(cfgPath, 'utf8');
  let changes = 0;

  // Introduce CI_FLAKE_SAMPLING flag to force retries=0 on CI
  if (!/CI_FLAKE_SAMPLING/.test(content)) {
    content = content.replace(
      /retries:\s*process\.env\.CI\s*\?\s*2\s*:\s*0\s*,/,
      "retries: process.env.CI ? (process.env.CI_FLAKE_SAMPLING === '1' ? 0 : 2) : 0,",
    );
    changes += 1;
  }

  if (changes > 0) fs.writeFileSync(cfgPath, content, 'utf8');

  return {
    ok: true,
    message: changes > 0 ? '已添加 CI_FLAKE_SAMPLING=1 触发零重试抽样能力' : '已具备去抖抽样控制',
    outputs: changes ? [{ path: 'playwright.config.ts', type: 'TO_MODIFY', description: '增加 CI_FLAKE_SAMPLING 控制' }] : [],
  };
}

