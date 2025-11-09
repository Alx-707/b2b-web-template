#!/usr/bin/env node

/**
 * Translation File Splitter
 *
 * Splits translation files into critical (first-screen) and deferred (lazy-loaded) parts.
 *
 * Usage: node scripts/split-translations.js
 */

const fs = require('fs');
const path = require('path');

// Critical translation keys (first-screen required + SSR required)
const CRITICAL_KEYS = [
  'home.hero', // Hero section (16 keys)
  'home.techStack', // Tech stack section - SSR required
  'home.showcase', // Component showcase - SSR required
  'home.overview', // Project overview - SSR required
  'home.cta', // Call to action - SSR required
  'navigation', // Navigation menu (32 keys)
  'theme', // Theme switcher (11 keys)
  'language', // Language toggle (30 keys)
  'footer.sections', // Footer sections (15 keys)
  'seo', // SEO metadata - required for all pages SSR (973 bytes)
  'structured-data', // Structured data - required for all pages SSR (577 bytes)
  'underConstruction', // Under construction pages - required for About/Blog/Products/Contact SSR (2843 bytes)
  'common.loading', // Loading text (1 key)
  'common.error', // Error text (1 key)
  'accessibility', // Accessibility labels (6 keys)
];

/**
 * Check if a key path matches any critical key pattern
 */
function isCriticalKey(keyPath) {
  return CRITICAL_KEYS.some((criticalKey) => {
    // Exact match or prefix match
    return keyPath === criticalKey || keyPath.startsWith(criticalKey + '.');
  });
}

/**
 * Set a nested value in an object using dot notation
 */
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Recursively extract keys from nested object
 */
function extractKeys(obj, prefix = '', critical = {}, deferred = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively process nested objects
      extractKeys(value, fullKey, critical, deferred);
    } else {
      // Leaf node - assign to critical or deferred
      if (isCriticalKey(fullKey)) {
        setNestedValue(critical, fullKey, value);
      } else {
        setNestedValue(deferred, fullKey, value);
      }
    }
  }
}

/**
 * Count total keys in an object (recursively)
 */
function countKeys(obj) {
  let count = 0;

  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      count += countKeys(value);
    } else {
      count++;
    }
  }

  return count;
}

/**
 * Split translations for a specific locale
 */
function splitTranslations(locale) {
  console.log(`\n📦 Processing locale: ${locale}`);

  // Read original translation file
  const inputPath = path.join(__dirname, '..', 'messages', `${locale}.json`);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: Translation file not found: ${inputPath}`);
    process.exit(1);
  }

  const fullMessages = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const totalKeys = countKeys(fullMessages);

  console.log(`   Total keys in original file: ${totalKeys}`);

  // Extract critical and deferred keys
  const critical = {};
  const deferred = {};

  extractKeys(fullMessages, '', critical, deferred);

  const criticalKeys = countKeys(critical);
  const deferredKeys = countKeys(deferred);

  console.log(
    `   Critical keys: ${criticalKeys} (${((criticalKeys / totalKeys) * 100).toFixed(1)}%)`,
  );
  console.log(
    `   Deferred keys: ${deferredKeys} (${((deferredKeys / totalKeys) * 100).toFixed(1)}%)`,
  );

  // Verify completeness
  if (criticalKeys + deferredKeys !== totalKeys) {
    console.error(
      `❌ Error: Key count mismatch! ${criticalKeys} + ${deferredKeys} ≠ ${totalKeys}`,
    );
    process.exit(1);
  }

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'messages', locale);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write critical.json
  const criticalPath = path.join(outputDir, 'critical.json');
  fs.writeFileSync(criticalPath, JSON.stringify(critical, null, 2) + '\n');
  console.log(`   ✅ Created: ${path.relative(process.cwd(), criticalPath)}`);

  // Write deferred.json
  const deferredPath = path.join(outputDir, 'deferred.json');
  fs.writeFileSync(deferredPath, JSON.stringify(deferred, null, 2) + '\n');
  console.log(`   ✅ Created: ${path.relative(process.cwd(), deferredPath)}`);

  return { totalKeys, criticalKeys, deferredKeys };
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Translation File Splitter');
  console.log('================================\n');
  console.log('Critical keys patterns:');
  CRITICAL_KEYS.forEach((key) => console.log(`   - ${key}`));

  const locales = ['en', 'zh'];
  const results = {};

  for (const locale of locales) {
    results[locale] = splitTranslations(locale);
  }

  console.log('\n✅ Split completed successfully!\n');
  console.log('Summary:');
  console.log('--------');

  for (const [locale, stats] of Object.entries(results)) {
    console.log(
      `${locale.toUpperCase()}: ${stats.criticalKeys} critical + ${stats.deferredKeys} deferred = ${stats.totalKeys} total`,
    );
  }

  console.log('\n📁 Output structure:');
  console.log('   messages/');
  console.log('   ├── en/');
  console.log('   │   ├── critical.json');
  console.log('   │   └── deferred.json');
  console.log('   └── zh/');
  console.log('       ├── critical.json');
  console.log('       └── deferred.json');

  console.log('\n💡 Next steps:');
  console.log('   1. Review generated files');
  console.log('   2. Update layout.tsx to use critical.json');
  console.log('   3. Create DeferredTranslationsProvider component');
  console.log('   4. Update page.tsx to use DeferredTranslationsProvider\n');
}

// Run the script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { splitTranslations, isCriticalKey };
