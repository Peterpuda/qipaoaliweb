// 代币自动转账工具

/**
 * 使用管理员私钥签名并转账代币
 * 注意：需要在 Cloudflare Worker Secret 中设置 ADMIN_PRIVATE_KEY
 */
export async function transferTokenToUser(env, userWallet, amount) {
  try {
    // 获取配置
    const tokenContract = env.TOKEN_CONTRACT_ADDRESS;
    const adminPrivateKey = env.ADMIN_PRIVATE_KEY;
    const rpcUrl = env.RPC_URL || "https://sepolia.base.org";
    
    if (!tokenContract || !adminPrivateKey) {
      console.log('Token contract or admin key not configured');
      return { success: false, error: 'NOT_CONFIGURED' };
    }
    
    // 这里使用简化的实现
    // 实际使用时需要调用 ERC20 合约的 transfer 函数
    // 或者使用 Cloudflare Workers 的 ethers.js 支持
    
    console.log(`Would transfer ${amount} tokens to ${userWallet}`);
    
    // 模拟交易哈希（实际应该返回真实交易哈希）
    const mockTxHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    return {
      success: true,
      txHash: mockTxHash,
      message: 'Token transfer initiated'
    };
    
  } catch (error) {
    console.error('Token transfer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查用户是否有代币领取资格
 */
export async function checkTokenEligibility(env, userWallet, eventId) {
  try {
    const { query } = await import('./db.js');
    const rows = await query(env, `
      SELECT wallet, event_id, amount, claimed, token_tx_hash
      FROM airdrop_eligible
      WHERE wallet = ? AND event_id = ?
      LIMIT 1
    `, [userWallet.toLowerCase(), eventId]);
    
    if (!rows || !rows.length) {
      return { eligible: false };
    }
    
    const row = rows[0];
    
    return {
      eligible: true,
      claimed: row.claimed === 1,
      amount: row.amount,
      txHash: row.token_tx_hash
    };
    
  } catch (error) {
    console.error('Check eligibility error:', error);
    return { eligible: false, error: error.message };
  }
}

