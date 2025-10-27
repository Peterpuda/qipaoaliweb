# 管理员白名单地址管理

## 📍 当前设置位置

管理员白名单地址现在通过 **Cloudflare Secret** 进行管理，更加安全。

### 配置位置
- **Secret 名称**: `ADMIN_WALLETS_SECRET`
- **Worker 名称**: `songbrocade-api`
- **回退配置**: `wrangler.toml` 中的 `ADMIN_WALLETS` 环境变量

## 🔧 管理方法

### 方法1：使用 Wrangler 命令（推荐）

```bash
# 设置管理员地址列表（用逗号分隔）
echo "0xEf85456652ada05f12708b9bDcF215780E780D18,0x2222222222222222222222222222222222222222" | npx wrangler secret put ADMIN_WALLETS_SECRET --name songbrocade-api

# 查看当前 secrets
npx wrangler secret list --name songbrocade-api

# 删除 secret（如果需要）
npx wrangler secret delete ADMIN_WALLETS_SECRET --name songbrocade-api
```

### 方法2：使用管理脚本

```bash
# 查看帮助
node manage-admin.js

# 设置管理员地址列表
node manage-admin.js set 0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222
```

### 方法3：通过 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 选择 **songbrocade-api** 项目
4. 进入 **Settings** > **Variables**
5. 找到 **ADMIN_WALLETS_SECRET** 并编辑

## 📝 当前管理员地址

根据最新配置，当前的管理员白名单包含：
- `0xEf85456652ada05f12708b9bDcF215780E780D18`
- `0x2222222222222222222222222222222222222222`

## ⚠️ 重要注意事项

1. **地址格式**: 必须是有效的以太坊地址格式（0x开头，42个字符）
2. **分隔符**: 多个地址用逗号分隔，不要有空格
3. **大小写**: 地址会自动转换为小写进行比较
4. **部署**: 修改后需要重新部署 Worker 才能生效
5. **安全**: Secret 比环境变量更安全，不会在代码中暴露

## 🔄 代码逻辑

系统会按以下优先级查找管理员白名单：
1. **ADMIN_WALLETS_SECRET** (Secret) - 最高优先级
2. **ADMIN_WALLETS** (环境变量) - 回退选项
3. 空字符串 - 默认值

## 🚀 部署更新

修改管理员白名单后，需要重新部署 Worker：

```bash
cd worker-api
npx wrangler deploy
```

## 🛠️ 故障排除

### 问题：无法创建 ADMIN_WALLETS secret
**原因**: 该名称已被环境变量使用
**解决**: 使用 `ADMIN_WALLETS_SECRET` 作为 secret 名称

### 问题：管理员权限验证失败
**原因**: 地址格式不正确或未在列表中
**解决**: 检查地址格式，确保在管理员列表中

### 问题：修改后不生效
**原因**: 未重新部署 Worker
**解决**: 运行 `npx wrangler deploy` 重新部署
