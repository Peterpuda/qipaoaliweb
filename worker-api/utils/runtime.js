// worker-api/utils/runtime.js
//
// 这个模块提供：
// - 通用响应封装 (jsonResponse / errorResponse)
// - Bearer 鉴权解析 (getBearer / decodeToken / requireUser / requireAdmin)
// - 通用ID生成 genId()
// - 收货信息加密 encryptShipping() / decryptShipping()
// - 徽章签名payload构建 buildBadgeSignaturePayload()
// - 以及其他 Worker 使用到的通用逻辑
//
// 注意：DB 相关的查询（query/run/ensureSchema）已经在 utils/db.js 里有了，这里不重复。

// ----------- 工具函数 -----------

function genId() {
    const t = Date.now().toString(16);
    const r = Math.floor(Math.random() * 1e16).toString(16);
    return `id_${t}_${r}`;
  }
  
  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
  }
  
  async function readJson(req) {
    try {
      return await req.json();
    } catch (e) {
      return null;
    }
  }
  
  // 提取 Authorization: Bearer xxx
  function getBearer(req) {
    const auth = req.headers.get("Authorization") || "";
    const parts = auth.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }
    return null;
  }
  
  // ----------- 鉴权 / 身份认证 -----------
  
  // 这部分非常重要：你的项目里已经有“用钱包签名 -> 后端返回token”的流程，
  // 实际上 decodeToken(token, env) 应该已经存在在你当前的 worker 逻辑里（可能在别的文件）。
  // 现在我们集中到 runtime.js 里。
  // 如果你已有 decodeToken，则用你的真实实现覆盖下面这个占位。
  
  async function decodeToken(token, env) {
    try {
      // 测试模式：允许特定的测试 token
      if (token === "test-token-123") {
        return { wallet: "0x1234567890123456789012345678901234567890" };
      }
      if (token === "test-token-456") {
        return { wallet: "0x9876543210987654321098765432109876543210" };
      }
      
      // 解析真实的 Base64 token
      // 后端生成格式：btoa(JSON.stringify({ addr, ts }))
      const decoded = atob(token);
      const payload = JSON.parse(decoded);
      
      // 将 addr 映射为 wallet，保持向后兼容
      return { 
        wallet: payload.addr || payload.wallet,
        ts: payload.ts 
      };
    } catch (error) {
      console.error("Token decode error:", error);
      return null;
    }
  }
  
  // 管理员校验：地址是否在 env.ADMIN_WALLETS 白名单里
  async function requireAdmin(req, env) {
    const bearer = getBearer(req);
    if (!bearer) return { ok: false, reason: "NO_TOKEN" };
  
    const payload = await decodeToken(bearer, env);
    if (!payload || !payload.wallet) {
      return { ok: false, reason: "BAD_TOKEN" };
    }
  
    // 优先使用 secret，如果不存在则使用环境变量
    const adminWallets = env.ADMIN_WALLETS_SECRET || env.ADMIN_WALLETS || "";
    const adminList = adminWallets
      .toLowerCase()
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  
    if (!adminList.includes(payload.wallet.toLowerCase())) {
      return { ok: false, reason: "NOT_ADMIN" };
    }
  
    return { ok: true, wallet: payload.wallet.toLowerCase() };
  }
  
  // 普通用户校验：只要是合法登录的钱包就行
  async function requireUser(req, env) {
    const bearer = getBearer(req);
    if (!bearer) return { ok: false, reason: "NO_TOKEN" };
  
    const payload = await decodeToken(bearer, env);
    if (!payload || !payload.wallet) {
      return { ok: false, reason: "BAD_TOKEN" };
    }
  
    return { ok: true, wallet: payload.wallet.toLowerCase() };
  }
  
  // ----------- AES-GCM 加密/解密（收货信息隐私） -----------
  // SHIPPING_KEY: Cloudflare Worker 环境变量，值为 base64 编码的 32字节随机数
  
  function b64ToBytes(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }
  
  function bytesToB64(buf) {
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  
  async function importAesKey(env) {
    const rawKeyB64 = env.SHIPPING_KEY;
    if (!rawKeyB64) throw new Error("Missing SHIPPING_KEY env");
    const rawKey = b64ToBytes(rawKeyB64);
    return crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }
  
  async function encryptShipping(shippingInfoObj, env) {
    const key = await importAesKey(env);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(shippingInfoObj || {}));
    const ctBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      plaintext
    );
    return JSON.stringify({
      iv: bytesToB64(iv),
      ct: bytesToB64(ctBuffer)
    });
  }
  
  // 给以后管理员“查看单个订单详细收货信息”用的解密。
  // 暂时前端不调用这个，只是后端留口。
  async function decryptShipping(encStr, env) {
    if (!encStr) return null;
    let parsed;
    try {
      parsed = JSON.parse(encStr);
    } catch (e) {
      return null;
    }
    const { iv, ct } = parsed;
    if (!iv || !ct) return null;
  
    const key = await importAesKey(env);
    const ivBytes = b64ToBytes(iv);
    const ctBytes = b64ToBytes(ct);
  
    const ptBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      key,
      ctBytes
    );
    const txt = new TextDecoder().decode(ptBuffer);
    try {
      return JSON.parse(txt);
    } catch (e) {
      return null;
    }
  }
  
  // ----------- 徽章签名payload -----------
  // 这里生成的是“用户去 mintWithSig(...) 时需要的授权包”。
  // 真正的签名（payload.signature）需要你用平台私钥签出来。
  // 我这里保留 signature 占位 "0xTODO_SIGNATURE"，结构保持不变。
  // 当你把真实签名逻辑补上，只需要改这个函数内部，不影响别的调用方。
  
  async function buildBadgeSignaturePayload(env, {
    badgeContract,
    tokenId,
    toWallet,
    nonce,
    deadline
  }) {
    // TODO: 实现真正的 EIP-712 签名
    // 当前返回占位符，实际部署时需要实现真实的签名逻辑
    return {
      contract: badgeContract,
      tokenId,
      to: toWallet,
      amount: "1",          // 默认给1份徽章
      deadline,
      nonce,                // bytes32 / unique
      signature: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" // 占位符签名
    };
  }
  
  export {
    genId,
    jsonResponse,
    errorResponse,
    readJson,
    getBearer,
    requireAdmin,
    requireUser,
    encryptShipping,
    decryptShipping,
    buildBadgeSignaturePayload
  };