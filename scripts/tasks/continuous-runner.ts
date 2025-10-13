#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { HandlerResult, Task, TasksFile, nowIso } from './types';

// Handlers
import handleT0 from './handlers/t0_build_failure_matrix';
import handleT1 from './handlers/t1_stabilize_dropdown_assertions';
import handleT2 from './handlers/t2_replace_html_lang_wait';
import handleT3 from './handlers/t3_unify_axe_reinjection';
import handleT4 from './handlers/t4_mobile_nav_sheet_fix';
import handleT5 from './handlers/t5_trailing_slash_tolerance';
import handleT6 from './handlers/t6_isolate_compatibility_limits';
import handleT7 from './handlers/t7_hang_fix_guidance';
import handleT8 from './handlers/t8_rerun_and_summarize';
import handleT9 from './handlers/t9_debounce_and_regression';

type HandlerMap = Array<{
  match: (t: Task) => boolean;
  run: (t: Task) => Promise<HandlerResult>;
}>;

const tasksFilePath = path.join(process.cwd(), 'docs', 'data', 'tasks.json');

function loadTasks(): TasksFile {
  const raw = fs.readFileSync(tasksFilePath, 'utf8');
  return JSON.parse(raw) as TasksFile;
}

function saveTasks(data: TasksFile) {
  fs.writeFileSync(tasksFilePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function depsMet(task: Task, all: Task[]) {
  const deps = task.dependencies || [];
  return deps.every((d) => all.find((t) => t.id === d.taskId)?.status === 'completed');
}

const handlers: HandlerMap = [
  // T0: 基线失败矩阵
  {
    match: (t) => /T0\s*:/.test(t.name) || t.id.startsWith('f0c6f2b0-'),
    run: handleT0,
  },
  // T1: 下拉断言稳定化
  {
    match: (t) => /T1\s*:/.test(t.name) || t.id.startsWith('7b3f2a9c-'),
    run: handleT1,
  },
  // T2: html[lang] 等待替换
  {
    match: (t) => /T2\s*:/.test(t.name) || t.id.startsWith('2d8a6e74-'),
    run: handleT2,
  },
  // T3: 统一 axe 规则与二次注入
  {
    match: (t) => /T3\s*:/.test(t.name) || t.id.startsWith('b1a0f7c5-'),
    run: handleT3,
  },
  // T4: 移动端导航断言与交互修正
  {
    match: (t) => /T4\s*:/.test(t.name) || t.id.startsWith('9f4b3d86-'),
    run: handleT4,
  },
  // T5: 规范路径断言与末尾斜杠
  {
    match: (t) => /T5\s*:/.test(t.name) || t.id.startsWith('d672e0a4-'),
    run: handleT5,
  },
  // T6: 标注并隔离已知兼容性限制
  {
    match: (t) => /T6\s*:/.test(t.name) || t.id.startsWith('4a2c1b7d-'),
    run: handleT6,
  },
  // T7: 处理测试结束挂起问题
  {
    match: (t) => /T7\s*:/.test(t.name) || t.id.startsWith('f5a1c9d0-'),
    run: handleT7,
  },
  // T8: 全量重跑并输出报告
  {
    match: (t) => /T8\s*:/.test(t.name) || t.id.startsWith('a4b2e1c0-'),
    run: handleT8,
  },
  // T9: 持续去抖与回归验证
  {
    match: (t) => /T9\s*:/.test(t.name) || t.id.startsWith('c7d9e2f1-'),
    run: handleT9,
  },
];

async function runTask(task: Task): Promise<HandlerResult> {
  const entry = handlers.find((h) => h.match(task));
  if (!entry) {
    return { ok: false, message: '未配置处理器，保留待处理状态' };
  }
  return entry.run(task);
}

async function main() {
  if (!fs.existsSync(tasksFilePath)) {
    console.error(`未找到任务文件: ${tasksFilePath}`);
    process.exit(1);
  }

  let { tasks } = loadTasks();

  // Process until no more runnable tasks change status in a single pass
  let progressed = true;
  while (progressed) {
    progressed = false;

    for (const task of tasks) {
      // Skip completed/failed/skipped
      if (task.status === 'completed' || task.status === 'failed' || task.status === 'skipped') continue;

      // If dependencies are not met, skip for now
      if (task.dependencies?.length && !depsMet(task, tasks)) continue;

      // Mark in progress
      if (task.status !== 'in_progress') {
        task.status = 'in_progress';
        task.updatedAt = nowIso();
        saveTasks({ tasks });
      }

      // Run the handler
      /* eslint-disable no-await-in-loop */
      const res = await runTask(task);

      // Update status
      if (res.ok) {
        task.status = 'completed';
        task.updatedAt = nowIso();
        // Track outputs back into the task if useful
        if (res.outputs?.length) {
          const existing = task.relatedFiles || [];
          task.relatedFiles = [
            ...existing,
            ...res.outputs.filter((o) => !existing.some((e) => e.path === o.path)),
          ];
        }
      } else {
        task.status = 'failed';
        task.updatedAt = nowIso();
        task.analysisResult = `连续模式失败: ${res.message || '未知错误'}`;
      }

      // Persist after each task
      saveTasks({ tasks });
      console.log(`任务: ${task.name} -> ${task.status}. ${res.message || ''}`);
      progressed = true; // We did work this pass
    }
  }

  console.log('\n🎯 连续模式执行完成。当前任务状态摘要:');
  const done = tasks.filter((t) => t.status === 'completed').length;
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const failed = tasks.filter((t) => t.status === 'failed').length;
  console.log(`已完成: ${done}/${total}, 待处理: ${pending}, 失败: ${failed}`);
}

main().catch((e) => {
  console.error('连续模式执行异常:', e);
  process.exit(1);
});
