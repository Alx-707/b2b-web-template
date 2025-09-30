# Chrome MCP 服务器配置报告

**生成时间**: 2025-09-30  
**任务**: Chrome MCP 服务器连接诊断与修复

---

## 📋 任务概述

Chrome MCP (Model Context Protocol) 服务器是一个基于 Chrome 扩展的浏览器自动化工具，允许 AI 助手通过 MCP 协议控制用户的日常 Chrome 浏览器。

**仓库地址**: https://github.com/hangwin/mcp-chrome

---

## 🔍 诊断结果

### 1. 问题识别

**症状**: 调用 `chrome_navigate_chrome-mcp` 等工具时返回错误：
```
Error calling tool: Failed to connect to MCP server
```

**根本原因**: Chrome MCP 服务器未在 Claude Desktop 配置文件中注册

### 2. 环境检查

#### ✅ Chrome MCP Bridge 已安装
```bash
路径: /Users/Data/Library/pnpm/global/5/node_modules/mcp-chrome-bridge/
文件: dist/mcp/mcp-server-stdio.js
状态: 存在且可执行
```

#### ✅ Chrome 扩展已安装
根据用户确认，Chrome 浏览器扩展已正确安装。

#### ❌ Claude Desktop 配置缺失
Chrome MCP 服务器未在 `~/Library/Application Support/Claude/claude_desktop_config.json` 中配置。

---

## 🔧 修复方案

### 步骤 1: 备份原配置

```bash
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json \
   ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup
```

### 步骤 2: 更新配置文件

添加 `chrome-mcp` 服务器配置到 Claude Desktop 配置文件：

```json
{
  "mcpServers": {
    "chrome-mcp": {
      "command": "node",
      "args": [
        "/Users/Data/Library/pnpm/global/5/node_modules/mcp-chrome-bridge/dist/mcp/mcp-server-stdio.js"
      ]
    },
    "context7-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@upstash/context7-mcp"
      ]
    },
    "mcp-shrimp-task-manager": {
      "command": "node",
      "args": [
        "/Users/Data/Tool/MCP/shrimp-task-manager-main/dist/index.js"
      ],
      "env": {
        "DATA_DIR": "/Users/Data/Warehouse/Focus/tucsenberg-web-frontier/docs/data",
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    },
    "desktop-commander": {
      "command": "npx",
      "args": [
        "@wonderwhy-er/desktop-commander@latest"
      ]
    },
    "zen": {
      "command": "/Users/Data/Tool/MCP/zen-mcp-server/.zen_venv/bin/python",
      "args": [
        "/Users/Data/Tool/MCP/zen-mcp-server/server.py"
      ]
    },
    "mcp-feedback-enhanced": {
      "command": "/Users/Data/.local/bin/uv",
      "args": [
        "run",
        "--directory",
        "/Users/Data/Tool/MCP/mcp-feedback-enhanced-master",
        "python",
        "-m",
        "mcp_feedback_enhanced",
        "server"
      ],
      "env": {
        "MCP_DESKTOP_MODE": "true",
        "MCP_WEB_PORT": "8765",
        "MCP_DEBUG": "false"
      }
    }
  }
}
```

### 步骤 3: 重启 Claude Desktop

配置更新后，需要重启 Claude Desktop 以加载新的 MCP 服务器配置。

---

## ✅ 验证步骤

### 1. 检查配置文件

```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | grep -A 5 "chrome-mcp"
```

**预期输出**:
```json
"chrome-mcp": {
  "command": "node",
  "args": [
    "/Users/Data/Library/pnpm/global/5/node_modules/mcp-chrome-bridge/dist/mcp/mcp-server-stdio.js"
  ]
}
```

### 2. 测试 MCP 服务器启动

```bash
node /Users/Data/Library/pnpm/global/5/node_modules/mcp-chrome-bridge/dist/mcp/mcp-server-stdio.js
```

**预期行为**: 服务器启动并等待 stdio 输入（这是正常的 MCP 服务器行为）

### 3. 在 Claude Desktop 中测试

重启 Claude Desktop 后，尝试使用 Chrome MCP 工具：

```
请使用 Chrome 浏览器打开 http://localhost:3000
```

**预期结果**: 工具成功调用，Chrome 浏览器打开指定页面

---

## 📚 Chrome MCP 功能说明

### 核心功能

1. **浏览器导航**
   - `chrome_navigate_chrome-mcp`: 导航到指定 URL
   - `chrome_go_back_or_forward_chrome-mcp`: 前进/后退

2. **页面交互**
   - `chrome_click_element_chrome-mcp`: 点击元素
   - `chrome_fill_or_select_chrome-mcp`: 填写表单
   - `chrome_keyboard_chrome-mcp`: 键盘输入

3. **内容获取**
   - `chrome_get_web_content_chrome-mcp`: 获取页面内容
   - `chrome_screenshot_chrome-mcp`: 截图
   - `chrome_get_interactive_elements_chrome-mcp`: 获取可交互元素

4. **标签页管理**
   - `get_windows_and_tabs_chrome-mcp`: 获取所有窗口和标签页
   - `chrome_close_tabs_chrome-mcp`: 关闭标签页

5. **网络监控**
   - `chrome_network_debugger_start_chrome-mcp`: 开始捕获网络请求
   - `chrome_network_debugger_stop_chrome-mcp`: 停止捕获并返回数据
   - `chrome_network_capture_start_chrome-mcp`: 使用 webRequest API 捕获
   - `chrome_network_capture_stop_chrome-mcp`: 停止 webRequest 捕获

6. **高级功能**
   - `chrome_inject_script_chrome-mcp`: 注入脚本
   - `chrome_send_command_to_inject_script_chrome-mcp`: 向注入脚本发送命令
   - `chrome_console_chrome-mcp`: 捕获控制台输出
   - `chrome_history_chrome-mcp`: 检索浏览历史
   - `chrome_bookmark_search_chrome-mcp`: 搜索书签
   - `chrome_bookmark_add_chrome-mcp`: 添加书签
   - `chrome_bookmark_delete_chrome-mcp`: 删除书签
   - `search_tabs_content_chrome-mcp`: 搜索标签页内容

### 使用场景

1. **自动化测试**: 在真实浏览器环境中测试 Web 应用
2. **数据抓取**: 从需要登录的网站获取数据
3. **UI 测试**: 验证用户界面和交互流程
4. **性能监控**: 捕获网络请求和性能指标
5. **浏览器自动化**: 自动化重复性浏览器任务

---

## 🔄 与 Playwright MCP 的对比

| 特性 | Chrome MCP | Playwright MCP |
|------|-----------|----------------|
| **浏览器** | 用户日常 Chrome | 独立 Playwright 浏览器 |
| **登录状态** | ✅ 保留用户登录 | ❌ 需要重新登录 |
| **扩展支持** | ✅ 支持 Chrome 扩展 | ❌ 不支持扩展 |
| **多浏览器** | ❌ 仅 Chrome | ✅ Chrome/Firefox/Safari |
| **无头模式** | ❌ 需要 GUI | ✅ 支持无头模式 |
| **适用场景** | 日常浏览器自动化 | 端到端测试 |

**推荐使用策略**:
- **Chrome MCP**: 需要使用用户登录状态、Chrome 扩展或日常浏览器环境
- **Playwright MCP**: 自动化测试、CI/CD 集成、无头浏览器场景

---

## 🚨 注意事项

### 1. Chrome 扩展依赖

Chrome MCP 需要安装对应的 Chrome 扩展才能工作。确保：
- ✅ 扩展已从 Chrome Web Store 或本地安装
- ✅ 扩展已启用
- ✅ 扩展有必要的权限

### 2. 浏览器必须运行

与 Playwright 不同，Chrome MCP 需要 Chrome 浏览器已经在运行。如果浏览器关闭，工具将无法工作。

### 3. 安全考虑

Chrome MCP 可以访问用户的真实浏览器环境，包括：
- 登录状态和 Cookies
- 浏览历史和书签
- 已安装的扩展

请谨慎使用，避免在不受信任的环境中运行。

### 4. 性能影响

Chrome MCP 在用户的日常浏览器中运行，可能会：
- 影响浏览器性能
- 干扰用户的正常浏览
- 触发网站的反爬虫机制

---

## 📖 使用示例

### 示例 1: 打开页面并截图

```
请使用 Chrome 浏览器打开 http://localhost:3000/en，然后截图保存
```

### 示例 2: 填写表单

```
请在当前 Chrome 页面中：
1. 找到 "Full Name" 输入框，填写 "John Doe"
2. 找到 "Email" 输入框，填写 "john@example.com"
3. 点击 "Submit" 按钮
```

### 示例 3: 监控网络请求

```
请开始监控 Chrome 的网络请求，然后访问 http://localhost:3000，
等待页面加载完成后，停止监控并显示所有 API 请求
```

### 示例 4: 搜索书签

```
请在 Chrome 书签中搜索包含 "Next.js" 的书签
```

---

## 🎯 总结

### 问题状态: ✅ 已修复

Chrome MCP 服务器配置已成功添加到 Claude Desktop 配置文件中。

### 修复内容

1. ✅ 识别配置缺失问题
2. ✅ 备份原配置文件
3. ✅ 添加 `chrome-mcp` 服务器配置
4. ✅ 更新配置文件

### 下一步操作

1. **重启 Claude Desktop** - 加载新配置
2. **测试 Chrome MCP 工具** - 验证连接成功
3. **查看 Chrome 扩展** - 确保扩展正常运行
4. **开始使用** - 利用 Chrome MCP 进行浏览器自动化

### 故障排除

如果重启后仍然无法连接：

1. **检查 Chrome 扩展**
   - 打开 `chrome://extensions/`
   - 确认 MCP Chrome Bridge 扩展已启用
   - 检查扩展是否有错误

2. **检查 Node.js 路径**
   ```bash
   which node
   # 确保路径正确
   ```

3. **手动测试服务器**
   ```bash
   node /Users/Data/Library/pnpm/global/5/node_modules/mcp-chrome-bridge/dist/mcp/mcp-server-stdio.js
   # 应该启动并等待输入
   ```

4. **查看 Claude Desktop 日志**
   - macOS: `~/Library/Logs/Claude/`
   - 查找 MCP 相关错误信息

---

**报告生成**: Augment AI Agent  
**配置文件**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**备份文件**: `~/Library/Application Support/Claude/claude_desktop_config.json.backup`

