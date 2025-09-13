#!/bin/bash

# 修复 social-icons-accessibility-i18n.test.tsx 文件中的类型错误

FILE="src/components/ui/__tests__/social-icons-accessibility-i18n.test.tsx"

# 替换 platform='twitter' 为 icon='twitter' label='Twitter'
sed -i '' "s/platform='twitter'/icon='twitter'\n            label='Twitter'/g" "$FILE"

# 替换 aria-label= 为 ariaLabel=
sed -i '' 's/aria-label=/ariaLabel=/g' "$FILE"

echo "修复完成: $FILE"
