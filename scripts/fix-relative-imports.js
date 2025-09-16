#!/usr/bin/env node

/**
 * 自动修复相对路径导入问题
 * 将相对路径导入转换为 @/ 绝对路径导入
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

/**
 * 递归获取所有 TypeScript 文件
 */
function getAllTSFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // 跳过 node_modules 和其他不需要的目录
        if (
          !['node_modules', '.next', '.git', 'dist', 'build'].includes(item)
        ) {
          traverse(fullPath);
        }
      } else if (item.match(/\.(ts|tsx)$/)) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * 检查文件是否包含相对路径导入
 */
function hasRelativeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return (
      /import\s+.*?\s+from\s+['"][.\/]/m.test(content) ||
      /export\s+.*?\s+from\s+['"][.\/]/m.test(content)
    );
  } catch (error) {
    return false;
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
  console.log('🔧 开始修复相对路径导入问题...\n');

  // 获取所有 TypeScript 文件
  const allFiles = getAllTSFiles(PROJECT_ROOT);
  console.log(`扫描了 ${allFiles.length} 个 TypeScript 文件`);

  // 筛选出包含相对路径导入的文件
  const filesToFix = allFiles.filter(hasRelativeImports);
  console.log(`发现 ${filesToFix.length} 个需要修复的文件\n`);

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
