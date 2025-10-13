#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { HandlerResult, Task } from '../types';

type PWLocation = { file?: string; line?: number; column?: number };
type PWError = { message?: string; stack?: string; location?: PWLocation };
type PWResult = { status?: string; error?: PWError };
type PWTest = { projectId?: string; projectName?: string; results?: PWResult[]; status?: string };
type PWSpec = { title?: string; ok?: boolean; tests?: PWTest[]; file?: string; line?: number };
type PWSuite = { title?: string; file?: string; specs?: PWSpec[]; suites?: PWSuite[] };
type PWReport = { suites?: PWSuite[] };

type MatrixRow = {
  project: string;
  specFile: string;
  testTitle: string;
  failureType: string;
  message: string;
  line?: number;
  suspectedFlake: boolean;
};

function classifyFailure(msg: string, specTitle: string): { type: string; suspectedFlake: boolean } {
  const m = msg || '';
  const title = specTitle || '';

  // Basic buckets aligned to the task description
  if (/accessibility|axe|violations/i.test(m)) {
    return { type: 'a11y', suspectedFlake: false };
  }
  if (/toHaveURL|URL|redirect|trailing\s*slash|404|not\s*found/i.test(m)) {
    return { type: '路径/路由', suspectedFlake: false };
  }
  if (/Timeout|exceeded.*timeout|timed\s*out/i.test(m)) {
    return { type: '等待/超时', suspectedFlake: /dropdown|menu|sheet|portal|mobile|动画|animation/i.test(title + ' ' + m) };
  }
  if (/toBeVisible|element\(s\) not found|not visible|detached from DOM/i.test(m)) {
    return { type: '可见性/Portal/动画', suspectedFlake: true };
  }
  if (/toHaveAttribute.*lang|document\.documentElement\.lang/i.test(m)) {
    return { type: 'html[lang] 等待', suspectedFlake: false };
  }
  if (/toHaveText|toContainText|text/i.test(m)) {
    return { type: '文本断言', suspectedFlake: false };
  }
  if (/strict mode/i.test(m)) {
    return { type: '严格模式选择器', suspectedFlake: false };
  }
  return { type: '脚本/其他', suspectedFlake: false };
}

function collectFailures(report: PWReport): MatrixRow[] {
  const rows: MatrixRow[] = [];
  const suites = report.suites || [];

  const walkSuite = (s: PWSuite) => {
    (s.specs || []).forEach((spec) => {
      (spec.tests || []).forEach((t) => {
        if (t.status === 'unexpected') {
          const r = (t.results || [])[0];
          const msg = r?.error?.message || '';
          const head = msg.split('\n')[0]?.trim() || '';
          const { type, suspectedFlake } = classifyFailure(head, spec.title || '');
          rows.push({
            project: t.projectName || 'unknown',
            specFile: s.file || spec.file || 'unknown',
            testTitle: spec.title || 'unknown',
            failureType: type,
            message: head.slice(0, 180),
            line: r?.error?.location?.line ?? spec.line,
            suspectedFlake,
          });
        }
      });
    });
    (s.suites || []).forEach(walkSuite);
  };

  suites.forEach(walkSuite);
  return rows.filter((r) => r.specFile && r.testTitle);
}

function renderMarkdown(rows: MatrixRow[]): string {
  const header = [
    '# E2E 失败矩阵',
    '',
    `生成时间: ${new Date().toISOString()}`,
    '',
    '| 项目(Project) | Spec 文件 | 测试标题 | 失败类型 | 嫌疑 Flake | 示例信息 |',
    '|---|---|---|---|---|---|',
  ];

  const body = rows.map((r) => {
    const flake = r.suspectedFlake ? '✅' : '';
    const msg = r.message.replace(/\|/g, '\\|');
    return `| ${r.project} | ${r.specFile} | ${r.testTitle} | ${r.failureType} | ${flake} | ${msg} |`;
  });

  // Simple per-project summary
  const byProject = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.project] = (acc[r.project] || 0) + 1;
    return acc;
  }, {});
  const summary = ['', '## 按项目统计', '', '| 项目 | 失败数 |', '|---|---|', ...Object.entries(byProject).map(([k, v]) => `| ${k} | ${v} |`)];

  return [...header, ...body, ...summary, ''].join('\n');
}

export default async function handleT0(task: Task): Promise<HandlerResult> {
  try {
    const reportPath = path.join(process.cwd(), 'reports', 'playwright-results.json');
    if (!fs.existsSync(reportPath)) {
      return { ok: false, message: `未找到报告文件: ${reportPath}` };
    }
    const raw = fs.readFileSync(reportPath, 'utf8');
    const report: PWReport = JSON.parse(raw);

    const rows: MatrixRow[] = collectFailures(report);

    if (rows.length === 0) {
      return { ok: true, message: '无失败用例，矩阵为空', outputs: [] };
    }

    const outDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const md = renderMarkdown(rows);
    const mdPath = path.join(outDir, 'e2e-failure-matrix.md');
    fs.writeFileSync(mdPath, md, 'utf8');

    const jsonPath = path.join(outDir, 'e2e-failure-matrix.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));

    return {
      ok: true,
      message: `已生成失败矩阵: ${mdPath}`,
      outputs: [
        { path: 'reports/e2e-failure-matrix.md', type: 'OUTPUT', description: '失败聚合矩阵' },
        { path: 'reports/e2e-failure-matrix.json', type: 'OUTPUT', description: '失败矩阵（JSON）' },
      ],
    };
  } catch (e: any) {
    return { ok: false, message: e?.message || String(e) };
  }
}
