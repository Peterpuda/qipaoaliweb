#!/usr/bin/env node

/**
 * 管理员白名单地址管理脚本
 * 使用方法：
 * node manage-admin.js list                    # 列出当前管理员地址
 * node manage-admin.js add <address>           # 添加管理员地址
 * node manage-admin.js remove <address>        # 移除管理员地址
 * node manage-admin.js set <address1,address2> # 设置管理员地址列表
 */

const { execSync } = require('child_process');

const WORKER_NAME = 'songbrocade-api';
const SECRET_NAME = 'ADMIN_WALLETS_SECRET';

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', cwd: __dirname });
  } catch (error) {
    console.error('命令执行失败:', error.message);
    process.exit(1);
  }
}

function getCurrentAdmins() {
  try {
    const result = runCommand(`npx wrangler secret list --name ${WORKER_NAME}`);
    const secrets = JSON.parse(result);
    const adminSecret = secrets.find(s => s.name === SECRET_NAME);
    
    if (!adminSecret) {
      console.log('❌ 未找到管理员白名单 secret');
      return [];
    }
    
    // 注意：wrangler secret list 不会显示 secret 的值，只能看到名称
    console.log('✅ 管理员白名单 secret 已存在');
    console.log('⚠️  注意：无法直接查看 secret 的值，请使用 Cloudflare Dashboard 查看');
    return [];
  } catch (error) {
    console.error('获取管理员列表失败:', error.message);
    return [];
  }
}

function addAdmin(address) {
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    console.error('❌ 无效的钱包地址格式');
    return;
  }
  
  // 获取当前管理员列表（这里需要手动输入，因为无法直接读取 secret 值）
  console.log('请手动输入当前的管理员地址列表（用逗号分隔）：');
  console.log('例如：0xEf85456652ada05f12708b9bDcF215780E780D18,0x2222222222222222222222222222222222222222');
  console.log('然后按回车继续...');
  
  // 这里需要用户手动输入，因为 wrangler secret 无法直接读取值
  console.log('⚠️  请使用以下命令手动更新：');
  console.log(`echo "当前地址列表,${address}" | npx wrangler secret put ${SECRET_NAME} --name ${WORKER_NAME}`);
}

function removeAdmin(address) {
  console.log('⚠️  请使用以下命令手动更新：');
  console.log(`echo "移除${address}后的地址列表" | npx wrangler secret put ${SECRET_NAME} --name ${WORKER_NAME}`);
}

function setAdmins(addressList) {
  if (!addressList || addressList.length === 0) {
    console.error('❌ 请提供至少一个管理员地址');
    return;
  }
  
  // 验证地址格式
  for (const addr of addressList) {
    if (!addr.startsWith('0x') || addr.length !== 42) {
      console.error(`❌ 无效的钱包地址格式: ${addr}`);
      return;
    }
  }
  
  const adminString = addressList.join(',');
  console.log(`设置管理员地址列表: ${adminString}`);
  
  try {
    runCommand(`echo "${adminString}" | npx wrangler secret put ${SECRET_NAME} --name ${WORKER_NAME}`);
    console.log('✅ 管理员白名单已更新');
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  }
}

function showHelp() {
  console.log(`
🔧 管理员白名单地址管理工具

使用方法：
  node manage-admin.js list                    # 列出当前管理员地址
  node manage-admin.js add <address>           # 添加管理员地址
  node manage-admin.js remove <address>        # 移除管理员地址
  node manage-admin.js set <address1,address2> # 设置管理员地址列表

示例：
  node manage-admin.js list
  node manage-admin.js add 0x1234567890123456789012345678901234567890
  node manage-admin.js set 0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222

注意：
  - 所有地址必须是有效的以太坊地址格式（0x开头，42个字符）
  - 多个地址用逗号分隔，不要有空格
  - 修改后需要重新部署 Worker 才能生效
  `);
}

// 主程序
const command = process.argv[2];

switch (command) {
  case 'list':
    getCurrentAdmins();
    break;
  case 'add':
    addAdmin(process.argv[3]);
    break;
  case 'remove':
    removeAdmin(process.argv[3]);
    break;
  case 'set':
    const addresses = process.argv[3]?.split(',').map(addr => addr.trim()).filter(Boolean);
    setAdmins(addresses);
    break;
  default:
    showHelp();
}
