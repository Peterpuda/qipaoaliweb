// worker/index.ts
// Cloudflare Worker with Hono
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Ethers for signing
import { ethers } from 'ethers'

type Bindings = {
  D1: D1Database,
  ADMIN_PRIVATE_KEY: string,
  POAP_CONTRACT: string,
  RPC_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

// utils
function genCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)]
  return s
}

app.post('/api/poap/code', async (c) => {
  const { eventId } = await c.req.json()
  if (!eventId) return c.json({ ok:false, message: 'eventId required' }, 400)

  const code = genCode(6)
  const nonce = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  await c.env.D1.prepare(
    `INSERT INTO checkin_tokens(event_id, code, nonce, expires_at) VALUES (?1, ?2, ?3, ?4)`
  ).bind(eventId, code, nonce, expiresAt).run()

  return c.json({ ok:true, code, expiresAt })
})

app.post('/api/poap/checkin', async (c) => {
  const { eventId, wallet, code, nonce } = await c.req.json()
  if (!eventId || !wallet || !code) return c.json({ ok:false, message: 'bad request' }, 400)
// 一次性调试：查看是否读到三项机密
  app.get('/api/debug/env', (c) => {
    return c.json({
      hasAdminKey: !!c.env.ADMIN_PRIVATE_KEY,
      hasContract: !!c.env.POAP_CONTRACT,
      hasRpc: !!c.env.RPC_URL,
      // 仅用于对照（避免泄露）：长度检查
      contractLen: (c.env.POAP_CONTRACT || '').length,
      rpcLen: (c.env.RPC_URL || '').length
    });
  });
  // 1) 校验 code 是否存在、未过期、未使用
  const now = new Date().toISOString()
  const row = await c.env.D1.prepare(
    `SELECT id, used, expires_at FROM checkin_tokens WHERE event_id=?1 AND code=?2 ORDER BY id DESC LIMIT 1`
  ).bind(eventId, code).first()
  if (!row) return c.json({ ok:false, message: 'invalid code' }, 400)
  if (row.used) return c.json({ ok:false, message: 'code used' }, 400)
  if (row.expires_at < now) return c.json({ ok:false, message: 'code expired' }, 400)

  // 2) 标记已用
  await c.env.D1.prepare(
    `UPDATE checkin_tokens SET used=1 WHERE id=?1`
  ).bind(row.id).run()

  // 3) 读取链上合约 nonce（可选校验）
  const provider = new ethers.JsonRpcProvider(c.env.RPC_URL)
  const contract = new ethers.Contract(
    c.env.POAP_CONTRACT,
    ["function nonces(address) view returns (uint256)"],
    provider
  )
  const onchainNonce = await contract.nonces(wallet)
  // 可选：比较与前端提供的 nonce 是否一致（若传了）
  if (nonce && onchainNonce.toString() !== String(nonce)) {
    // 不拒绝，仅记录：客户端与链上 nonce 不一致可能因并发；生产可根据策略处理
  }

  // 4) 离线签名（EIP-712）
  const deadline = Math.floor(Date.now()/1000) + 10 * 60 // 10分钟有效
  const amount = 1
  const signer = new ethers.Wallet(c.env.ADMIN_PRIVATE_KEY, provider)

  // 读取链ID
  const { chainId } = await provider.getNetwork()

  // EIP-712 domain & types
  const domain = {
    name: "Poap1155WithSig",
    version: "1",
    chainId: Number(chainId),
    verifyingContract: c.env.POAP_CONTRACT
  }
  const types = {
    Mint: [
      { name: "to", type: "address" },
      { name: "eventId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  }
  const message = {
    to: wallet,
    eventId: Number(eventId),
    amount,
    nonce: Number(onchainNonce),
    deadline
  }

  const signature = await signer.signTypedData(domain, types, message)
  const sig = ethers.Signature.from(signature)

  // 5) 写签到记录（简化）
  await c.env.D1.prepare(
    `INSERT INTO checkins(event_id, wallet, code, tx_hash) VALUES (?1, ?2, ?3, ?4)`
  ).bind(eventId, wallet, code, "").run()

  // 6) 返回前端签名包
  return c.json({
    ok: true,
    eventId: Number(eventId),
    amount,
    deadline,
    v: sig.v,
    r: sig.r,
    s: sig.s
  })
})

export default app
