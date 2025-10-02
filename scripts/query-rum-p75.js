#!/usr/bin/env node
/**
 * RUM P75 查询脚本
 * 查询 Vercel Analytics 真实用户性能数据（P75）
 *
 * P1.1 任务：建立真实用户性能基线
 *
 * 使用方法：
 * node scripts/query-rum-p75.js --metric=LCP --days=7
 *
 * 环境变量：
 * - VERCEL_TOKEN: Vercel API Token
 * - VERCEL_TEAM_ID: Vercel Team ID
 * - VERCEL_PROJECT_ID: Vercel Project ID
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const https = require('https');

// 解析命令行参数
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value;
  return acc;
}, {});

const METRIC = args.metric || 'LCP';
const DAYS = parseInt(args.days || '7', 10);

// 环境变量
const {
  VERCEL_TOKEN,
  VERCEL_TEAM_ID: TEAM_ID,
  VERCEL_PROJECT_ID: PROJECT_ID,
} = process.env;

// 验证环境变量
if (!VERCEL_TOKEN || !TEAM_ID || !PROJECT_ID) {
  console.error('❌ 缺少必需的环境变量：');
  console.error('   VERCEL_TOKEN:', VERCEL_TOKEN ? '✅' : '❌');
  console.error('   VERCEL_TEAM_ID:', TEAM_ID ? '✅' : '❌');
  console.error('   VERCEL_PROJECT_ID:', PROJECT_ID ? '✅' : '❌');
  console.error('\\n请在 .env.local 中配置这些变量');
  process.exit(1);
}

/**
 * 查询 Vercel Analytics 数据
 */
async function queryVercelAnalytics(metric, days) {
  const endDate = Date.now();
  const startDate = endDate - days * 24 * 60 * 60 * 1000;

  const path = `/api/v1/analytics?teamId=${TEAM_ID}&projectId=${PROJECT_ID}&metric=${metric.toLowerCase()}&from=${startDate}&to=${endDate}`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'vercel.com',
      path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(
            new Error(
              `API request failed with status ${res.statusCode}: ${data}`,
            ),
          );
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * 计算百分位数
 */
function calculatePercentile(values, percentile) {
  if (values.length === 0) return 0;

  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * 格式化时间（毫秒）
 */
function formatTime(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * 获取性能评级
 */
function getRating(metric, value) {
  const thresholds = {
    LCP: { good: 2500, needsImprovement: 4000 },
    FCP: { good: 1800, needsImprovement: 3000 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    TTFB: { good: 800, needsImprovement: 1800 },
    INP: { good: 200, needsImprovement: 500 },
  };

  const threshold = thresholds[metric.toUpperCase()];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 查询 Vercel Analytics RUM 数据...');
  console.log(`   指标: ${METRIC}`);
  console.log(`   时间范围: 最近 ${DAYS} 天\\n`);

  try {
    const data = await queryVercelAnalytics(METRIC, DAYS);

    // 提取数值数据
    const values = data.values || [];

    if (values.length === 0) {
      console.log('⚠️  未找到数据，可能原因：');
      console.log('   1. 生产环境尚未部署');
      console.log('   2. 时间范围内无用户访问');
      console.log('   3. Analytics 未正确配置');
      return;
    }

    // 计算统计数据
    const p50 = calculatePercentile(values, 50);
    const p75 = calculatePercentile(values, 75);
    const p90 = calculatePercentile(values, 90);
    const p95 = calculatePercentile(values, 95);

    const rating = getRating(METRIC, p75);

    // 输出结果
    console.log('📊 RUM 性能数据（真实用户）：\\n');
    console.log(`   指标: ${METRIC}`);
    console.log(`   样本数: ${values.length}`);
    console.log(
      `   时间范围: ${new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} ~ ${new Date().toISOString().split('T')[0]}\\n`,
    );

    console.log('   百分位数：');
    console.log(`   P50 (中位数): ${formatTime(p50)}`);
    console.log(`   P75 (目标):   ${formatTime(p75)} [${rating}]`);
    console.log(`   P90:          ${formatTime(p90)}`);
    console.log(`   P95:          ${formatTime(p95)}\\n`);

    // 性能评估
    console.log('🎯 性能评估：');
    if (rating === 'good') {
      console.log(`   ✅ ${METRIC} P75 表现良好（≤目标阈值）`);
    } else if (rating === 'needs-improvement') {
      console.log(`   ⚠️  ${METRIC} P75 需要改进（接近阈值）`);
    } else {
      console.log(`   ❌ ${METRIC} P75 表现不佳（超过阈值）`);
    }

    // 输出 JSON 格式（便于脚本集成）
    if (args.json) {
      console.log('\\n📄 JSON 输出：');
      console.log(
        JSON.stringify(
          {
            metric: METRIC,
            sampleSize: values.length,
            timeRange: {
              start: new Date(
                Date.now() - DAYS * 24 * 60 * 60 * 1000,
              ).toISOString(),
              end: new Date().toISOString(),
            },
            percentiles: {
              p50,
              p75,
              p90,
              p95,
            },
            rating,
          },
          null,
          2,
        ),
      );
    }
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    console.error('\\n请检查：');
    console.error('   1. VERCEL_TOKEN 是否有效');
    console.error('   2. TEAM_ID 和 PROJECT_ID 是否正确');
    console.error('   3. 网络连接是否正常');
    process.exit(1);
  }
}

main();
