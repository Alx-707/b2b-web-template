#!/usr/bin/env node

/**
 * 修复剩余的相对路径导入问题
 * 专门处理 export { ... } from './...' 语法
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const PROJECT_ROOT = process.cwd();

/**
 * 获取所有有 no-restricted-imports 错误的文件
 */
function getFilesWithErrors() {
  try {
    const output = execSync('npm run lint:check 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');

    const files = new Set();

    for (const line of lines) {
      if (line.includes('no-restricted-imports')) {
        // 提取文件路径
        const match = line.match(/^([^:]+):/);
        if (match) {
          files.add(match[1]);
        }
      }
    }

    return Array.from(files);
  } catch (error) {
    console.error('获取错误文件列表失败:', error.message);
    return [];
  }
}

/**
 * 将相对路径转换为绝对路径
 */
function convertRelativeToAbsolute(filePath, importPath) {
  // 如果已经是绝对路径，跳过
  if (importPath.startsWith('@/') || !importPath.startsWith('.')) {
    return importPath;
  }

  // 获取文件所在目录
  const fileDir = path.dirname(filePath);

  // 解析相对路径
  const absolutePath = path.resolve(fileDir, importPath);

  // 检查是否在项目根目录内
  if (!absolutePath.startsWith(PROJECT_ROOT)) {
    console.warn(`  警告: 路径超出项目范围 ${importPath} -> ${absolutePath}`);
    return importPath; // 保持原样
  }

  // 转换为相对于项目根目录的路径
  let relativePath = path.relative(PROJECT_ROOT, absolutePath);

  // 如果路径不在 src 目录内，使用 @/../ 前缀
  if (!relativePath.startsWith('src/')) {
    return `@/../${relativePath.replace(/\\/g, '/')}`;
  }

  // 移除 src/ 前缀并转换为 @/ 路径
  relativePath = relativePath.substring(4); // 移除 'src/'
  return `@/${relativePath.replace(/\\/g, '/')}`;
}

/**
 * 修复单个文件的导入
 */
function fixFileImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 匹配 import 语句
      const importMatch = line.match(
        /^(\s*import\s+.*?\s+from\s+['"])([^'"]+)(['"].*)/,
      );
      if (importMatch) {
        const [, prefix, importPath, suffix] = importMatch;

        // 只处理相对路径导入
        if (importPath.startsWith('.')) {
          const newPath = convertRelativeToAbsolute(filePath, importPath);
          lines[i] = prefix + newPath + suffix;
          modified = true;
          console.log(`  ${importPath} -> ${newPath}`);
        }
      }

      // 匹配 export 语句
      const exportMatch = line.match(
        /^(\s*export\s+.*?\s+from\s+['"])([^'"]+)(['"].*)/,
      );
      if (exportMatch) {
        const [, prefix, importPath, suffix] = exportMatch;

        // 只处理相对路径导入
        if (importPath.startsWith('.')) {
          const newPath = convertRelativeToAbsolute(filePath, importPath);
          lines[i] = prefix + newPath + suffix;
          modified = true;
          console.log(`  ${importPath} -> ${newPath}`);
        }
      }

      // 匹配多行 export 语句中的 from 行
      const multilineExportMatch = line.match(
        /^(\s*}\s+from\s+['"])([^'"]+)(['"].*)/,
      );
      if (multilineExportMatch) {
        const [, prefix, importPath, suffix] = multilineExportMatch;

        // 只处理相对路径导入
        if (importPath.startsWith('.')) {
          const newPath = convertRelativeToAbsolute(filePath, importPath);
          lines[i] = prefix + newPath + suffix;
          modified = true;
          console.log(`  ${importPath} -> ${newPath}`);
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      return true;
    }

    return false;
  } catch (error) {
    console.error(`修复文件失败 ${filePath}:`, error.message);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 开始修复剩余的相对路径导入问题...\n');

  const filesToFix = getFilesWithErrors();
  console.log(`发现 ${filesToFix.length} 个有错误的文件\n`);

  let fixedCount = 0;

  for (const filePath of filesToFix) {
    console.log(`修复文件: ${path.relative(PROJECT_ROOT, filePath)}`);

    if (fixFileImports(filePath)) {
      fixedCount++;
    }

    console.log('');
  }

  console.log(`✅ 修复完成！共修复 ${fixedCount} 个文件`);

  // 运行 ESLint 检查修复结果
  console.log('\n🔍 检查修复结果...');
  try {
    const result = execSync(
      'npm run lint:check 2>&1 | grep "no-restricted-imports" | wc -l',
      {
        encoding: 'utf8',
      },
    );
    console.log(`剩余 no-restricted-imports 错误: ${result.trim()}`);
  } catch (error) {
    console.log('无法检查修复结果');
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertRelativeToAbsolute, fixFileImports };
