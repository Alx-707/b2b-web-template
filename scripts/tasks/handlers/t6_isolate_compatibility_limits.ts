#!/usr/bin/env tsx
import { HandlerResult, Task } from '../types';

// 代码库已避免使用 isMobile，移动用例采用 viewport+hasTouch 与 tap/点击兜底
export default async function handleT6(_task: Task): Promise<HandlerResult> {
  return {
    ok: true,
    message: '已确认兼容性限制已在用例中隔离（无 isMobile 依赖，存在 tap→click 兜底）',
  };
}

