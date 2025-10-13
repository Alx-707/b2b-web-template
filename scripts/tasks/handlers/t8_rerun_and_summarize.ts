#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { HandlerResult, Task } from '../types';

function summarize(reportPath: string) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  let total = 0,
    passed = 0,
    failed = 0,
    skipped = 0;
  const perProject: Record<string, { total: number; failed: number; passed: number; skipped: number }> = {};

  const walk = (suite: any) => {
    (suite.specs || []).forEach((spec: any) => {
      (spec.tests || []).forEach((t: any) => {
        const p = t.projectName || 'unknown';
        perProject[p] ||= { total: 0, failed: 0, passed: 0, skipped: 0 };
        total++;
        perProject[p].total++;
        if (t.status === 'expected') {
          passed++;
          perProject[p].passed++;
        } else if (t.status === 'skipped') {
          skipped++;
          perProject[p].skipped++;
        } else if (t.status === 'unexpected') {
          failed++;
          perProject[p].failed++;
        }
      });
    });
    (suite.suites || []).forEach(walk);
  };
  (report.suites || []).forEach(walk);

  const passRate = total ? +(100 * (passed / total)).toFixed(2) : 0;
  return { total, passed, failed, skipped, passRate, perProject };
}

export default async function handleT8(_task: Task): Promise<HandlerResult> {
  const autoRun = process.env.AUTO_RUN_E2E === '1';
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  let runMsg = '跳过重跑，使用现有报告';
  if (autoRun) {
    try {
      child_process.execSync('pnpm -s exec playwright install --with-deps', { stdio: 'inherit' });
    } catch {}
    try {
      child_process.execSync('pnpm -s test:e2e', { stdio: 'inherit' });
      runMsg = '已执行全量重跑';
    } catch (e: any) {
      runMsg = `重跑失败: ${e?.message || e}`;
    }
  }

  const jsonPath = path.join(reportsDir, 'playwright-results.json');
  if (!fs.existsSync(jsonPath)) {
    return { ok: false, message: '未找到 Playwright JSON 报告，无法汇总' };
  }

  const summary = summarize(jsonPath);
  const outJson = path.join(reportsDir, 'e2e-summary-latest.json');
  fs.writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), runMsg, ...summary }, null, 2));

  const outMd = path.join(reportsDir, 'e2e-summary-latest.md');
  const lines = [
    '# E2E 执行摘要',
    `时间: ${new Date().toISOString()}`,
    '',
    `- 总数: ${summary.total}`,
    `- 通过: ${summary.passed}`,
    `- 失败: ${summary.failed}`,
    `- 跳过: ${summary.skipped}`,
    `- 通过率: ${summary.passRate}%`,
    '',
    '## 分项目统计',
    ...Object.entries(summary.perProject).map(
      ([p, s]) => `- ${p}: 通过 ${s.passed}/${s.total}, 失败 ${s.failed}, 跳过 ${s.skipped}`,
    ),
    '',
    `备注: ${runMsg}`,
    '',
  ];
  fs.writeFileSync(outMd, lines.join('\n'));

  return {
    ok: true,
    message: `已生成汇总报告 (${runMsg})`,
    outputs: [
      { path: 'reports/e2e-summary-latest.json', type: 'OUTPUT', description: 'E2E 汇总（JSON）' },
      { path: 'reports/e2e-summary-latest.md', type: 'OUTPUT', description: 'E2E 汇总（Markdown）' },
    ],
  };
}

