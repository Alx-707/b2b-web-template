#!/usr/bin/env node

/**
 * 批量修复相对路径导入问题
 * 直接处理文件列表，避免ESLint输出解析问题
 */

const fs = require('fs');
const path = require('path');

// 项目根目录
const PROJECT_ROOT = process.cwd();

// 需要修复的文件列表（从ESLint输出中提取）
const FILES_TO_FIX = [
  'src/lib/locale-storage-history.ts',
  'src/lib/locale-storage-maintenance.ts',
  'src/lib/locale-storage-preference.ts',
  'src/lib/locale-storage-types.ts',
  'src/lib/performance-monitoring-coordinator.ts',
  'src/lib/performance-monitoring-core.ts',
  'src/lib/performance-monitoring-integrations.ts',
];

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
  const fullPath = path.join(PROJECT_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  文件不存在: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 匹配各种导入/导出语句
      const patterns = [
        /^(\s*import\s+.*?\s+from\s+['"])([^'"]+)(['"].*)/,
        /^(\s*export\s+.*?\s+from\s+['"])([^'"]+)(['"].*)/,
        /^(\s*}\s+from\s+['"])([^'"]+)(['"].*)/,
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const [, prefix, importPath, suffix] = match;

          // 只处理相对路径导入
          if (importPath.startsWith('.')) {
            const newPath = convertRelativeToAbsolute(fullPath, importPath);
            if (newPath !== importPath) {
              lines[i] = prefix + newPath + suffix;
              modified = true;
              console.log(`  ${importPath} -> ${newPath}`);
            }
          }
          break; // 找到匹配就跳出
        }
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, lines.join('\n'));
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
  console.log('🔧 开始批量修复相对路径导入问题...\n');

  console.log(`准备修复 ${FILES_TO_FIX.length} 个文件\n`);

  let fixedCount = 0;

  for (const filePath of FILES_TO_FIX) {
    console.log(`修复文件: ${filePath}`);

    if (fixFileImports(filePath)) {
      fixedCount++;
    }

    console.log('');
  }

  console.log(`✅ 修复完成！共修复 ${fixedCount} 个文件`);
}

if (require.main === module) {
  main();
}

module.exports = { convertRelativeToAbsolute, fixFileImports };
