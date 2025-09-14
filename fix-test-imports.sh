#!/bin/bash

# 批量修复测试文件中的相对路径导入
echo "🔧 开始修复测试文件中的相对路径导入..."

# 修复 ../page 导入
echo "修复 ../page 导入..."
find src -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
    if grep -q "import.*from.*'../page'" "$file"; then
        # 获取文件所在目录的路径
        dir=$(dirname "$file")
        # 计算相对于src的路径
        relative_path=${dir#src/}
        # 替换导入
        sed -i.bak "s|from '../page'|from '@/${relative_path}/page'|g" "$file"
        echo "  ✅ 修复: $file"
    fi
done

# 修复 ../route 导入
echo "修复 ../route 导入..."
find src -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
    if grep -q "import.*from.*'../route'" "$file"; then
        # 获取文件所在目录的路径
        dir=$(dirname "$file")
        # 计算相对于src的路径
        relative_path=${dir#src/}
        # 替换导入
        sed -i.bak "s|from '../route'|from '@/${relative_path}/route'|g" "$file"
        echo "  ✅ 修复: $file"
    fi
done

# 清理备份文件
find src -name "*.bak" -delete

echo "✅ 测试文件导入修复完成！"
