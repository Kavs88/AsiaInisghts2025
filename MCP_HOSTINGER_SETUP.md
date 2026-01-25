# Hostinger MCP Server Setup

This guide shows you how to connect the Hostinger MCP server to Cursor for direct Hostinger API access.

## 📋 Configuration

The MCP server configuration is provided in `hostinger-mcp-config.json`.

## 🔧 Setup Instructions

### Step 1: Locate Cursor MCP Settings

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**Mac:**
```
~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

**Linux:**
```
~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### Step 2: Add Configuration

1. **Open the MCP settings file** (create it if it doesn't exist)
2. **Copy the contents** from `hostinger-mcp-config.json`
3. **Paste into the settings file** (merge with existing `mcpServers` if present)
4. **Save the file**

### Step 3: Restart Cursor

1. **Close Cursor completely**
2. **Reopen Cursor**
3. The MCP server should now be connected

### Step 4: Verify Connection

After restarting, the Hostinger MCP server should be available. You can verify by:
- Checking MCP resources (if available in Cursor UI)
- Using Hostinger-related commands in chat

## 📝 Alternative: Manual Setup

If the file path above doesn't work, try:

1. **Open Cursor Settings** (Ctrl+, or Cmd+,)
2. **Search for "MCP"** or "Model Context Protocol"
3. **Add the configuration** in the MCP settings section
4. **Use the JSON from `hostinger-mcp-config.json`**

## 🔐 Security Note

The API token in the configuration is sensitive. Make sure:
- ✅ The MCP settings file is not committed to git
- ✅ Only trusted users have access to your Cursor settings
- ✅ The token is kept secure

## 🎯 What This Enables

Once configured, you'll be able to:
- Manage Hostinger hosting directly from Cursor
- Deploy files and manage server settings
- Access Hostinger API resources through MCP
- Automate deployment tasks

## 🆘 Troubleshooting

### MCP Server Not Connecting

1. **Check Node.js is installed**: `node --version`
2. **Verify npx works**: `npx --version`
3. **Check Cursor logs** for MCP errors
4. **Verify API token** is correct in configuration

### Configuration Not Loading

1. **Check JSON syntax** is valid
2. **Ensure file is saved** in correct location
3. **Restart Cursor** completely
4. **Check Cursor version** supports MCP

### API Token Issues

1. **Verify token** is active in Hostinger dashboard
2. **Check token permissions** in Hostinger API settings
3. **Regenerate token** if needed

## 📚 Reference

- **Hostinger API Docs**: https://developers.hostinger.com/
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Configuration File**: `hostinger-mcp-config.json`



