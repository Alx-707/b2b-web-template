#!/usr/bin/env node
/*
 * 增量格式检查（仅针对暂存文件）
 * - 读取 Git 暂存区的文件列表
 * - 仅对这些文件运行 Prettier 格式检查
 * - 优化pre-commit性能，避免全量格式检查
 */

const { execSync, spawnSync } = require('child_process');

function getStagedFiles() {
  try {
    const output = execSync(
      'git diff --name-only --cached --diff-filter=ACMR',
      { stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .toString()
      .trim();
    if (!output) return [];

    // 过滤出 Prettier 支持的文件类型
    return output
      .split('\n')
      .filter((f) =>
        /\.(js|jsx|ts|tsx|json|md|css|scss|html|yml|yaml)$/i.test(f),
      );
  } catch {
    return [];
  }
}

function runPrettierCheck(files) {
  if (files.length === 0) {
    console.log('[format:check:staged] 无需检查：没有暂存的格式化文件');
    return 0;
  }

  console.log(`[format:check:staged] 检查 ${files.length} 个文件的格式...`);

  // 使用 prettier --check 对指定文件进行格式检查
  const result = spawnSync('npx', ['prettier', '--check', ...files], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  if (result.status !== 0) {
    console.error('[format:check:staged] 代码格式检查失败');
    console.error('请运行 pnpm format:write 修复格式问题');
    return result.status;
  }

  console.log('[format:check:staged] ✅ 代码格式检查通过');
  return 0;
}

function main() {
  const stagedFiles = getStagedFiles();
  const exitCode = runPrettierCheck(stagedFiles);
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = { getStagedFiles, runPrettierCheck };
