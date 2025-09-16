#!/usr/bin/env node
/*
 * 修复测试文件中错误的导入路径
 * - 将 '@/app/[locale]/xxx/__tests__/page' 修复为 '@/app/[locale]/xxx/page'
 * - 将 '@/app/api/xxx/__tests__/route' 修复为 '@/app/api/xxx/route'
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findTestFiles() {
  try {
    const output = execSync(
      'find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx"',
      { encoding: 'utf8' },
    );
    return output
      .trim()
      .split('\n')
      .filter((f) => f && !f.includes('node_modules'));
  } catch (error) {
    console.error('Error finding test files:', error.message);
    return [];
  }
}

function fixImportPaths(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 修复模式1: '@/app/[locale]/xxx/__tests__/page' -> '@/app/[locale]/xxx/page'
    const pattern1 = /@\/app\/\[locale\]\/([^\/]+)\/__tests__\/page/g;
    const newContent1 = content.replace(pattern1, (match, segment) => {
      modified = true;
      return `@/app/[locale]/${segment}/page`;
    });

    // 修复模式2: '@/app/api/xxx/__tests__/route' -> '@/app/api/xxx/route'
    const pattern2 = /@\/app\/api\/([^\/]+)\/__tests__\/route/g;
    const newContent2 = newContent1.replace(pattern2, (match, segment) => {
      modified = true;
      return `@/app/api/${segment}/route`;
    });

    // 修复模式3: '@/app/api/xxx/yyy/__tests__/route' -> '@/app/api/xxx/yyy/route'
    const pattern3 = /@\/app\/api\/([^\/]+)\/([^\/]+)\/__tests__\/route/g;
    const newContent3 = newContent2.replace(
      pattern3,
      (match, segment1, segment2) => {
        modified = true;
        return `@/app/api/${segment1}/${segment2}/route`;
      },
    );

    if (modified) {
      fs.writeFileSync(filePath, newContent3, 'utf8');
      console.log(`✅ 修复: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 查找测试文件...');
  const testFiles = findTestFiles();

  if (testFiles.length === 0) {
    console.log('未找到测试文件');
    return;
  }

  console.log(`📁 找到 ${testFiles.length} 个测试文件`);

  let fixedCount = 0;

  for (const file of testFiles) {
    if (fixImportPaths(file)) {
      fixedCount++;
    }
  }

  console.log(`\n🎉 修复完成！`);
  console.log(`📊 总计修复 ${fixedCount} 个文件`);

  if (fixedCount > 0) {
    console.log('\n💡 建议运行以下命令验证修复效果：');
    console.log('pnpm type-check:tests');
  }
}

if (require.main === module) {
  main();
}
