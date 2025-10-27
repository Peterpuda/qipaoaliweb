# 📅 每日签到功能使用指南

## 🎉 功能概述

**airdrop-2025** 活动现已支持**每日签到**功能！

### ✨ 核心特性

- ✅ **每天签到一次**：每个钱包地址每天可以签到一次
- ✅ **代币累加**：每次签到获得 **1000 枚代币**，自动累加到账户
- ✅ **积分奖励**：每次签到获得 **10 积分**
- ✅ **签到记录**：系统记录每次签到的时间和次数
- ✅ **明日再来**：今天签到后，明天 00:00 后可再次签到

---

## 📋 签到规则

### 1. 时间限制
- **每天一次**：北京时间 00:00 - 23:59:59 内只能签到一次
- **跨日重置**：每天 00:00 后计数重置，可以再次签到
- **无上限**：只要活动持续，可以连续签到无限天

### 2. 奖励规则

| 奖励类型 | 每次签到 | 累计方式 |
|---------|---------|---------|
| 🎁 积分 | 10 积分 | 每次独立奖励 |
| 💎 代币 | 1000 枚 | 自动累加 |

**示例**：
```
第 1 次签到：获得 1000 枚代币
第 2 次签到：获得 1000 枚代币（累计 2000 枚）
第 3 次签到：获得 1000 枚代币（累计 3000 枚）
...
第 N 次签到：获得 1000 枚代币（累计 N×1000 枚）
```

---

## 🚀 使用流程

### 步骤 1：访问签到页面

```
https://songbrocade-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
```

或从首页点击"领取通证"按钮。

### 步骤 2：连接钱包

1. 选择钱包类型（推荐"自动检测"）
2. 点击"连接钱包"
3. 确保在 **Base Sepolia** 测试网络

### 步骤 3：完成签到

1. 活动代码已自动填入（`airdrop-2025`）
2. 点击"铭刻我的到场"按钮
3. 等待交易确认

### 步骤 4：查看结果

签到成功后会显示：
```
🎉 签到成功！

📅 这是您的第 X 次签到
🎁 获得 10 积分
💎 累计可领取 X000 枚代币

关闭此窗口后，点击下方「🎁 领取代币」按钮完成领取。
```

### 步骤 5：领取代币

1. 关闭弹窗
2. 点击页面上的"🎁 领取 X000 枚代币"按钮
3. 确认智能合约交易
4. 等待代币到账

---

## ⏰ 重复签到提示

如果您今天已经签到过，会看到提示：

```
⏰ 您今天已经签到过了，请明天再来！
```

**解决方法**：等待到第二天（00:00 后）再来签到。

---

## 📊 签到数据示例

### 用户A的签到历史

| 日期 | 签到次数 | 当次奖励 | 累计代币 |
|------|---------|---------|---------|
| 2025-10-27 | 第 1 次 | 1000 | 1000 |
| 2025-10-28 | 第 2 次 | 1000 | 2000 |
| 2025-10-29 | 第 3 次 | 1000 | 3000 |
| 2025-10-30 | 第 4 次 | 1000 | 4000 |

**累计收益**：4000 枚代币 + 40 积分

---

## 🔍 技术实现

### 数据库字段

**airdrop_eligible 表新增字段**：

```sql
checkin_count INTEGER DEFAULT 0,        -- 签到次数
last_checkin_date TEXT,                 -- 最后签到日期
amount TEXT NOT NULL                    -- 累计代币数量
```

### API 响应字段

**签到成功响应**：

```json
{
  "ok": true,
  "id": "checkin_id_xxx",
  "ts": 1698400000,
  "points": 10,
  "eligible": true,
  "totalCheckins": 3,
  "totalTokens": "3000000000000000000000",
  "tokensPerCheckin": "1000000000000000000000",
  "message": "签到成功！这是您的第 3 次签到，累计可领取 3000 枚代币"
}
```

**重复签到响应**：

```json
{
  "ok": false,
  "error": "ALREADY_CHECKED_IN_TODAY",
  "message": "您今天已经签到过了，请明天再来！",
  "nextCheckinTime": "2025-10-28T00:00:00.000Z"
}
```

---

## 🎯 常见问题

### Q1: 今天签到了，什么时候可以再签？
**A**: 第二天（北京时间 00:00）后就可以再次签到。

### Q2: 我签到了 5 次，需要领取 5 次代币吗？
**A**: 不需要。代币会自动累加，您可以一次性领取所有累计的代币（例如 5000 枚）。

### Q3: 如果我今天忘记签到了怎么办？
**A**: 没关系，明天继续签到即可。签到次数会继续累加，不会清零。

### Q4: 我可以用多个钱包地址签到吗？
**A**: 可以。每个钱包地址独立计算，都可以每天签到一次。

### Q5: 签到次数有上限吗？
**A**: 目前没有上限，只要活动持续，就可以一直签到。

### Q6: 领取代币需要 Gas 费吗？
**A**: 需要。在 Base Sepolia 测试网上需要少量 ETH 作为 Gas 费（可从水龙头获取）。

---

## 📱 移动端体验

### 推荐使用
- Trust Wallet
- MetaMask Mobile
- imToken
- TokenPocket

### 连接方式
选择"WalletConnect（通用）"，扫描二维码即可连接。

---

## 🔐 安全提示

1. **保护私钥**：永远不要分享您的私钥或助记词
2. **确认网络**：务必在 Base Sepolia 测试网操作
3. **合约验证**：领取前确认合约地址正确
4. **测试环境**：这是测试网络，代币无实际价值

---

## 📞 技术支持

如遇到问题：

1. **检查网络**：确保连接到 Base Sepolia
2. **刷新页面**：按 Ctrl+Shift+R（或 Cmd+Shift+R）硬刷新
3. **查看控制台**：按 F12 查看错误信息
4. **联系管理员**：提供钱包地址和错误截图

---

## 🎊 活动信息

- **活动名称**：airdrop-2025
- **活动代码**：airdrop-2025
- **签到页面**：https://songbrocade-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
- **合约地址**：0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C
- **代币地址**：0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
- **网络**：Base Sepolia（Chain ID: 84532）

---

## 📈 数据统计

管理员可以通过以下 SQL 查询查看签到统计：

```sql
-- 查看总签到次数
SELECT COUNT(*) as total_checkins FROM checkins WHERE event_id = '25';

-- 查看每日签到人数
SELECT DATE(created_at) as date, COUNT(DISTINCT wallet) as unique_users
FROM checkins 
WHERE event_id = '25'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 查看用户签到排行榜
SELECT wallet, COUNT(*) as checkin_count
FROM checkins 
WHERE event_id = '25'
GROUP BY wallet
ORDER BY checkin_count DESC
LIMIT 10;

-- 查看累计代币分布
SELECT 
  wallet, 
  amount, 
  checkin_count,
  last_checkin_date
FROM airdrop_eligible
WHERE event_id = '25'
ORDER BY CAST(amount AS INTEGER) DESC
LIMIT 20;
```

---

## 🚀 开始签到吧！

现在就访问签到页面，开始您的每日签到之旅！

[👉 立即签到](https://songbrocade-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025)

---

**祝您签到愉快！🎉**

