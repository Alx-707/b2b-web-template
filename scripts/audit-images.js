/**
 * 图片审计脚本
 * 全局审计所有图片使用情况（img标签、next/image、priority属性、width/height）
 * 生成审计清单，识别首屏图片priority和尺寸问题
 */

const glob = require('glob');
const fs = require('fs');
const path = require('path');

// 确保reports目录存在
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const files = glob.sync('src/**/*.{tsx,jsx}', {
  cwd: path.join(__dirname, '..'),
});
// 排除测试文件
const productionFiles = files.filter(
  (file) => !file.includes('__tests__') && !file.includes('.test.'),
);
const results = [];
let totalImages = 0;
let totalIssues = 0;

console.log('🔍 开始审计图片使用情况...\n');
console.log(`总文件数: ${files.length}`);
console.log(`生产文件数: ${productionFiles.length}`);
console.log(`测试文件数: ${files.length - productionFiles.length}\n`);

productionFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // 搜索<img>标签
  const imgMatches = content.match(/<img[^>]*>/g) || [];

  // 搜索<Image>组件（next/image）
  const imageMatches = content.match(/<Image[^>]*>/g) || [];

  imgMatches.forEach((match) => {
    totalImages++;
    totalIssues++;
    results.push({
      path: file,
      type: 'img',
      code: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
      issue: 'Use next/image instead of <img> tag',
      severity: 'high',
    });
  });

  imageMatches.forEach((match) => {
    totalImages++;
    const issues = [];

    const hasPriority = /priority/.test(match);
    const hasWidth = /width=/.test(match);
    const hasHeight = /height=/.test(match);
    const hasFill = /fill/.test(match);

    // 检查width/height（除非使用fill属性）
    if (!hasFill && (!hasWidth || !hasHeight)) {
      issues.push('Missing width/height attributes (required for CLS=0)');
      totalIssues++;
    }

    // 检查priority（首屏图片应该有priority）
    // 注意：这里无法自动判断是否首屏，需要人工审查
    if (!hasPriority) {
      issues.push('Consider adding priority for above-fold images');
    }

    if (issues.length > 0) {
      results.push({
        path: file,
        type: 'next/image',
        code: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
        issues,
        severity: issues.some((i) => i.includes('width/height'))
          ? 'high'
          : 'medium',
      });
    }
  });
});

// 生成审计报告
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: productionFiles.length,
    totalImages,
    totalIssues,
    highSeverity: results.filter((r) => r.severity === 'high').length,
    mediumSeverity: results.filter((r) => r.severity === 'medium').length,
  },
  issues: results,
};

const reportPath = path.join(reportsDir, 'image-audit.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// 打印摘要
console.log('📊 审计完成！\n');
console.log(`总文件数: ${report.summary.totalFiles}`);
console.log(`总图片数: ${report.summary.totalImages}`);
console.log(`总问题数: ${report.summary.totalIssues}`);
console.log(`  - 高优先级: ${report.summary.highSeverity}`);
console.log(`  - 中优先级: ${report.summary.mediumSeverity}\n`);

if (report.summary.totalIssues > 0) {
  console.log('⚠️  发现以下问题：\n');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.path}`);
    console.log(`   类型: ${result.type}`);
    if (result.issue) {
      console.log(`   问题: ${result.issue}`);
    }
    if (result.issues) {
      result.issues.forEach((issue) => {
        console.log(`   - ${issue}`);
      });
    }
    console.log('');
  });
}

console.log(`📄 详细报告已保存至: ${reportPath}\n`);

// 如果有高优先级问题，退出码为1
if (report.summary.highSeverity > 0) {
  console.log('❌ 发现高优先级问题，请修复后重新运行审计。\n');
  process.exit(1);
} else {
  console.log('✅ 所有高优先级问题已解决！\n');
  process.exit(0);
}
