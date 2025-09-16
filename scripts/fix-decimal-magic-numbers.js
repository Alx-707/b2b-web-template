#!/usr/bin/env node
/*
 * 修复小数魔法数字错误
 * - 修复由于魔法数字替换导致的小数拆分问题
 * - 恢复正确的小数格式
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 需要修复的错误模式
const DECIMAL_FIXES = [
  // 格式: [错误模式, 正确值, 常量名]
  ['0\\.MAGIC_85', '0.85', 'DECIMAL_85_PERCENT'],
  ['0\\.MAGIC_95', '0.95', 'DECIMAL_95_PERCENT'],
  ['0\\.MAGIC_99', '0.99', 'DECIMAL_99_PERCENT'],
  ['0\\.MAGIC_96', '0.96', 'DECIMAL_96_PERCENT'],
  ['MAGIC_0_001', '0.001', 'DECIMAL_VERY_SMALL'],
  ['MAGIC_0_05', '0.05', 'DECIMAL_5_PERCENT'],
  ['MAGIC_0_12', '0.12', 'DECIMAL_12_PERCENT'],
  ['MAGIC_0_03', '0.03', 'DECIMAL_3_PERCENT'],
  ['MAGIC_0_85', '0.85', 'DECIMAL_85_PERCENT'],
  ['MAGIC_0_95', '0.95', 'DECIMAL_95_PERCENT'],
  ['MAGIC_0_99', '0.99', 'DECIMAL_99_PERCENT'],
  ['MAGIC_0_96', '0.96', 'DECIMAL_96_PERCENT'],
];

function findAffectedFiles() {
  try {
    const result = execSync(
      'grep -r "0\\.MAGIC_\\|MAGIC_0_" src/ --include="*.ts" --include="*.tsx" -l',
      {
        encoding: 'utf8',
        shell: true,
      },
    );
    return result
      .trim()
      .split('\n')
      .filter((file) => file.length > 0);
  } catch (error) {
    console.log('⚠️  没有找到受影响的文件');
    return [];
  }
}

function fixDecimalNumbers(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const fixedPatterns = [];

    for (const [pattern, correctValue, constantName] of DECIMAL_FIXES) {
      const regex = new RegExp(pattern, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, correctValue);
        modified = true;
        fixedPatterns.push(`${pattern} → ${correctValue}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复: ${filePath}`);
      fixedPatterns.forEach((fix) => console.log(`   ${fix}`));
      return fixedPatterns.length;
    }

    return 0;
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    return 0;
  }
}

function updateConstantsFile() {
  const constantsPath = 'src/constants/magic-numbers.ts';

  try {
    let content = fs.readFileSync(constantsPath, 'utf8');

    // 添加小数常量
    const decimalConstants = `
// 小数常量 (百分比和比例)
export const DECIMAL_3_PERCENT = 0.03;
export const DECIMAL_5_PERCENT = 0.05;
export const DECIMAL_12_PERCENT = 0.12;
export const DECIMAL_85_PERCENT = 0.85;
export const DECIMAL_95_PERCENT = 0.95;
export const DECIMAL_96_PERCENT = 0.96;
export const DECIMAL_99_PERCENT = 0.99;
export const DECIMAL_VERY_SMALL = 0.001;
`;

    // 在文件末尾添加小数常量
    if (!content.includes('DECIMAL_')) {
      content += decimalConstants;
      fs.writeFileSync(constantsPath, content, 'utf8');
      console.log(`✅ 更新常量文件: ${constantsPath}`);
    }
  } catch (error) {
    console.error(`❌ 更新常量文件失败:`, error.message);
  }
}

function main() {
  console.log('🔧 修复小数魔法数字错误...');

  const affectedFiles = findAffectedFiles();
  if (affectedFiles.length === 0) {
    console.log('✅ 没有发现需要修复的小数错误');
    return;
  }

  console.log(`📊 发现 ${affectedFiles.length} 个受影响的文件`);

  let totalFixes = 0;
  for (const filePath of affectedFiles) {
    totalFixes += fixDecimalNumbers(filePath);
  }

  // 更新常量文件
  updateConstantsFile();

  console.log(`\n🎉 修复完成！`);
  console.log(`📊 总计修复 ${totalFixes} 个小数错误`);

  if (totalFixes > 0) {
    console.log('\n💡 建议运行以下命令验证修复效果：');
    console.log('pnpm type-check');
  }
}

if (require.main === module) {
  main();
}
