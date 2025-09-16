#!/usr/bin/env node
/*
 * 增量TypeScript类型检查（仅针对暂存文件）
 * - 读取 Git 暂存区的 TypeScript 文件列表
 * - 仅对这些文件运行 tsc --noEmit
 * - 优化pre-commit性能，避免全量类型检查
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');

function getStagedTSFiles() {
  try {
    const output = execSync(
      'git diff --name-only --cached --diff-filter=ACMR',
      { stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .toString()
      .trim();
    if (!output) return [];
    return output.split('\n').filter((f) => /\.(ts|tsx)$/i.test(f));
  } catch {
    return [];
  }
}

function runTypeCheck(files) {
  if (files.length === 0) {
    console.log('[type-check:staged] 无需检查：没有暂存的 TypeScript 文件');
    return 0;
  }

  console.log(`[type-check:staged] 检查 ${files.length} 个 TypeScript 文件...`);

  // 使用 tsc --noEmit 对指定文件进行类型检查
  // 注意：tsc 不支持直接指定文件列表进行 --noEmit 检查
  // 所以我们使用项目配置，但只在有TS文件变更时运行
  const result = spawnSync('npx', ['tsc', '--noEmit', '--skipLibCheck'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  if (result.status !== 0) {
    console.error('[type-check:staged] TypeScript 类型检查失败');
    console.error('请修复类型错误后重新提交');
    return result.status;
  }

  console.log('[type-check:staged] ✅ TypeScript 类型检查通过');
  return 0;
}

function main() {
  const stagedFiles = getStagedTSFiles();
  const exitCode = runTypeCheck(stagedFiles);
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = { getStagedTSFiles, runTypeCheck };
