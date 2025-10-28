// worker-api/index.js

import {
  genId,
  jsonResponse,
  errorResponse,
  readJson,
  requireAdmin,
  requireUser,
  encryptShipping,
  buildBadgeSignaturePayload
} from "./utils/runtime.js";

import {
  buildArtisanSystemPrompt,
  buildChatMessages,
  callOpenAI,
  callClaude,
  generateMockReply,
  moderateContent,
  generateId,
  generateNarrative,
  generateMultipleNarratives
} from "./utils/ai-helpers.js";

// 导入 ethers（如果需要使用）
let ethers = null;
try {
  ethers = await import('ethers');
} catch (e) {
  console.log('ethers not available, skipping auto-transfer');
}

import {
  query,
  run,
  ensureSchema
} from "./utils/db.js";

// ------------------------------------
// CORS 工具函数
// ------------------------------------
// 选择允许的 Origin
function pickAllowedOrigin(req) {
  const origin = req.headers.get("Origin");
  const allowedOrigins = [
    "https://songbrocade-frontend.pages.dev",
    "https://b68f8563.songbrocade-frontend.pages.dev",
    "https://a5266e00.songbrocade-frontend.pages.dev",
    "https://802a7782.songbrocade-frontend.pages.dev",
    "https://a6f41712.songbrocade-frontend.pages.dev",
    "https://0199882e.poap-checkin-frontend.pages.dev",
    "https://poap-checkin-frontend.pages.dev",
    "https://5778b8a9.poap-checkin-frontend.pages.dev",
    "https://main.poap-checkin-frontend.pages.dev",
    "https://prod.poap-checkin-frontend.pages.dev",
    "https://aaad5357.poap-checkin-frontend.pages.dev",
    "https://df1bf775.poap-checkin-frontend.pages.dev",
    "https://15219dc1.poap-checkin-frontend.pages.dev",
    "https://d8468f53.poap-checkin-frontend.pages.dev",
    "https://5446e0e4.poap-checkin-frontend.pages.dev",
    "https://298cb9b4.poap-checkin-frontend.pages.dev",
    "https://2da61638.poap-checkin-frontend.pages.dev",
    "https://0179f589.poap-checkin-frontend.pages.dev",
    "https://998a854f.poap-checkin-frontend.pages.dev",
    "https://debae5d5.poap-checkin-frontend.pages.dev",
    "https://2e87f1ec.poap-checkin-frontend.pages.dev",
    "https://d1eeb901.poap-checkin-frontend.pages.dev",
    "https://6710bcdf.poap-checkin-frontend.pages.dev",
    "https://82842193.poap-checkin-frontend.pages.dev",
    "https://a4c0dab5.poap-checkin-frontend.pages.dev",
    "https://f9c67ad5.poap-checkin-frontend.pages.dev",
    "https://2de44c5e.poap-checkin-frontend.pages.dev",
    "https://777f13ee.poap-checkin-frontend.pages.dev",
    "https://9441691d.poap-checkin-frontend.pages.dev",
    "https://a6708607.poap-checkin-frontend.pages.dev",
    "https://branch-prod.poap-checkin-frontend.pages.dev",
    "https://prod.poap-checkin-frontend.pages.dev",
    "https://693f317c.poap-checkin-frontend.pages.dev",
    "http://10break.com",
    "https://10break.com",
    "http://localhost:8787",
    "http://localhost:3000",
    "http://127.0.0.1:8787"
  ];

  return allowedOrigins.includes(origin) ? origin : "https://songbrocade-frontend.pages.dev";
}

// 允许前端域名跨域访问
function withCors(resp, origin) {
  const allowedOrigin = origin || "https://songbrocade-frontend.pages.dev";
  
  const newHeaders = new Headers(resp.headers);

  newHeaders.set("Access-Control-Allow-Origin", allowedOrigin);
  newHeaders.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  newHeaders.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  newHeaders.set("Access-Control-Allow-Credentials", "true");

  return new Response(resp.body, {
    status: resp.status,
    headers: newHeaders
  });
}

// ------------------------------------
// 内部辅助：订单完成后确保徽章记录存在
// ------------------------------------
async function ensureBadgeIssueForOrder(env, orderNo) {
  const rows = await query(env, `
    SELECT
      o.order_no        AS order_no,
      o.wallet          AS buyer_wallet,
      o.product_id      AS product_id,
      o.status          AS status,
      p.badge_contract  AS badge_contract
    FROM orders o
    LEFT JOIN products_new p ON o.product_id = p.id
    WHERE o.order_no = ?
    LIMIT 1
  `, [orderNo]);

  const ord = rows && rows[0];
  if (!ord) {
    return { ok:false, reason:"ORDER_NOT_FOUND" };
  }
  if (ord.status !== "completed") {
    return { ok:false, reason:"ORDER_NOT_COMPLETED" };
  }
  if (!ord.badge_contract) {
    return { ok:false, reason:"NO_BADGE_CONTRACT" };
  }

  const tokenId = ord.product_id;
  const nowSec = Math.floor(Date.now() / 1000);
  const badgeDeadline = nowSec + 7*24*3600; // 7天有效
  const badgeId = genId();

  const sigPayload = await buildBadgeSignaturePayload(env, {
    badgeContract: ord.badge_contract,
    tokenId,
    toWallet: ord.buyer_wallet,
    nonce: badgeId,
    deadline: badgeDeadline
  });
  const sigStr = JSON.stringify(sigPayload);

  const existing = await query(env, `
    SELECT id
    FROM badges_issues
    WHERE order_id = ?
    LIMIT 1
  `, [orderNo]);

  if (!existing || !existing.length) {
    await run(env, `
      INSERT INTO badges_issues (
        id,
        order_id,
        buyer_wallet,
        token_id,
        contract_addr,
        sig_payload,
        claimed,
        created_at,
        updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, 0, strftime('%s','now'), strftime('%s','now')
      )
    `, [
      badgeId,
      orderNo,
      ord.buyer_wallet,
      tokenId,
      ord.badge_contract,
      sigStr
    ]);
  } else {
    await run(env, `
      UPDATE badges_issues
      SET sig_payload = ?, updated_at = strftime('%s','now')
      WHERE order_id = ?
    `, [
      sigStr,
      orderNo
    ]);
  }

  return { ok:true };
}

// ------------------------------------
// 用户获取徽章签名包
// GET /badge/claim-ticket?order_id=...
// ------------------------------------
async function handleGetBadgeTicket(req, env, searchParams) {
  const userCheck = await requireUser(req, env);
  if (!userCheck.ok) return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));

  const orderId = searchParams.get("order_id");
  if (!orderId) return withCors(errorResponse("missing order_id", 400), pickAllowedOrigin(req));

  const rows = await query(env, `
    SELECT
      b.order_id,
      b.buyer_wallet,
      b.token_id,
      b.contract_addr,
      b.sig_payload,
      b.claimed,
      o.status AS order_status
    FROM badges_issues b
    LEFT JOIN orders o ON b.order_id = o.order_no
    WHERE b.order_id = ?
    LIMIT 1
  `, [orderId]);

  if (!rows || !rows.length) {
    return withCors(errorResponse("badge not ready yet", 404), pickAllowedOrigin(req));
  }

  const row = rows[0];
  if (row.buyer_wallet.toLowerCase() !== userCheck.wallet.toLowerCase()) {
    return withCors(errorResponse("not your order", 403), pickAllowedOrigin(req));
  }
  if (row.order_status !== "completed") {
    return withCors(errorResponse("order not completed", 400), pickAllowedOrigin(req));
  }

  return withCors(jsonResponse({
    ok: true,
    badge: {
      order_id: row.order_id,
      token_id: row.token_id,
      contract_addr: row.contract_addr,
      claimed: row.claimed,
      payload: JSON.parse(row.sig_payload || "{}")
    }
  }), pickAllowedOrigin(req));
}

// ------------------------------------
// 管理员上传商品图 -> R2
// POST /admin/upload-image (multipart/form-data)
// ------------------------------------
async function handleUploadImage(req, env) {
  try {
    const adminCheck = await requireAdmin(req, env);
    if (!adminCheck.ok) return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return withCors(errorResponse("no file", 400), pickAllowedOrigin(req));
    }

    const key = `product_${Date.now()}_${Math.floor(Math.random()*1e6)}`;

    // 检查 R2_BUCKET 是否存在
    if (!env.R2_BUCKET) {
      console.error("R2_BUCKET not bound to worker");
      return withCors(errorResponse("R2_BUCKET not configured", 500), pickAllowedOrigin(req));
    }

    // 上传到 Cloudflare R2 存储桶
    await env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "image/jpeg"
      }
    });

    console.log(`Image uploaded successfully: ${key}`);
    return withCors(jsonResponse({ ok: true, key }), pickAllowedOrigin(req));
  } catch (error) {
    console.error("Upload image error:", error);
    return withCors(errorResponse(`upload failed: ${error.message}`, 500), pickAllowedOrigin(req));
  }
}

// ------------------------------------
// 保留原有的工具函数
// ------------------------------------
function stripApi(p) {
  return p.startsWith('/api/') ? p.slice(5) : p;
}

function corsify(res, env) {
  const origin = env.ALLOWED_ORIGINS || '*';
  res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res;
}

function json(env, data, status = 200) {
  return corsify(new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }), env);
}

function readBearerAddr(req) {
  const auth = req.headers.get('Authorization') || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.addr || payload.address || null;
  } catch {
    return null;
  }
}

function checkAdmin(addr, env) {
  // 优先使用 secret，如果不存在则使用环境变量
  const adminWallets = env.ADMIN_WALLETS_SECRET || env.ADMIN_WALLETS || '';
  const admins = adminWallets.split(',').map(a => a.toLowerCase().trim());
  return admins.includes(addr?.toLowerCase());
}

function adminRule(env) {
  return env.ADMIN_WALLETS_SECRET || env.ADMIN_WALLETS || 'none';
}

function randomHex(len) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// ------------------------------------
// fetch() 主路由
// ------------------------------------
export default {
  async fetch(req, env) {
    try {
      // 确保数据库schema是最新的
      await ensureSchema(env);
      
      const url = new URL(req.url);
      const { pathname, searchParams } = url;

      // --- CORS preflight ---
      if (req.method === "OPTIONS") {
        return withCors(
          new Response(null, { status: 204 }),
          pickAllowedOrigin(req)
        );
      }

      const path = stripApi(pathname);
      console.log('Request path:', pathname, 'stripped:', path);

      // health
      if (req.method === 'GET' && (path === '/' || path === '/health')) {
        return withCors(
          jsonResponse({ ok: true, service: 'worker-api', ts: Date.now() }),
          pickAllowedOrigin(req)
        );
      }

      // whoami
      if (req.method === 'GET' && path === '/admin/whoami') {
    const addr = readBearerAddr(req);
    const rule = adminRule(env);
        if (!addr) return json(env, { ok: false, error: 'NO_TOKEN', rule }, 401);
    const ok = checkAdmin(addr, env);
        return json(env, ok ? { ok: true, addr, rule } : { ok: false, error: 'NOT_ADMIN', addr, rule }, ok ? 200 : 403);
      }

      // auth: challenge
      if ((req.method === 'POST' || req.method === 'GET') && path === '/auth/challenge') {
        const body = req.method === 'POST' ? await readJson(req) : {};
    const addr = String(body.address || body.addr || '').toLowerCase();
    const nonce = randomHex(8);
    const message = [
      'Login to Admin',
      `Nonce: ${nonce}`,
          `Address: ${addr}`,
          `Timestamp: ${Date.now()}`
        ].join('\n');
        return withCors(
          jsonResponse({ ok: true, message, nonce }),
          pickAllowedOrigin(req)
        );
      }

      // auth: verify
      if (req.method === 'POST' && path === '/auth/verify') {
        const body = await readJson(req);
        if (!body || !body.address || !body.signature || !body.message) {
          return withCors(
            errorResponse("MISSING_FIELDS", 400),
            pickAllowedOrigin(req)
          );
        }
        const addr = String(body.address).toLowerCase();
        const isAdmin = checkAdmin(addr, env);
        if (!isAdmin) {
          return withCors(
            errorResponse("NOT_ADMIN", 403),
            pickAllowedOrigin(req)
          );
        }
        const token = btoa(JSON.stringify({ addr, ts: Date.now() }));
        return withCors(
          jsonResponse({ ok: true, token }),
          pickAllowedOrigin(req)
        );
      }

      // ============================================
      // AI 匠人智能体 API
      // ============================================

      // POST /admin/artisan-voice-upsert - 配置匠人 AI 人格
      if (pathname === "/admin/artisan-voice-upsert" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const body = await readJson(req);
          const {
            artisan_id,
            tone_style,
            self_intro_zh,
            self_intro_en,
            core_values,
            cultural_lineage,
            forbidden_topics,
            examples,
            model_config,
            enabled
          } = body;

          if (!artisan_id) {
            return withCors(errorResponse("missing artisan_id", 400), pickAllowedOrigin(req));
          }

          // 检查匠人是否存在
          const artisanRows = await query(env, `SELECT id FROM artisans WHERE id = ?`, [artisan_id]);
          if (!artisanRows || artisanRows.length === 0) {
            return withCors(errorResponse("artisan not found", 404), pickAllowedOrigin(req));
          }

          // 检查是否已存在配置
          const existingRows = await query(env, `SELECT id FROM artisan_voice WHERE artisan_id = ?`, [artisan_id]);

          const now = Math.floor(Date.now() / 1000);

          if (existingRows && existingRows.length > 0) {
            // 更新
            await run(env, `
              UPDATE artisan_voice 
              SET 
                tone_style = ?,
                self_intro_zh = ?,
                self_intro_en = ?,
                core_values = ?,
                cultural_lineage = ?,
                forbidden_topics = ?,
                examples = ?,
                model_config = ?,
                enabled = ?,
                updated_at = ?
              WHERE artisan_id = ?
            `, [
              tone_style || 'warm',
              self_intro_zh || null,
              self_intro_en || null,
              core_values || null,
              cultural_lineage || null,
              forbidden_topics ? JSON.stringify(forbidden_topics) : null,
              examples ? JSON.stringify(examples) : null,
              model_config ? JSON.stringify(model_config) : null,
              enabled !== undefined ? (enabled ? 1 : 0) : 1,
              now,
              artisan_id
            ]);

            return withCors(
              jsonResponse({ ok: true, action: 'updated', artisan_id }),
              pickAllowedOrigin(req)
            );
          } else {
            // 插入
            const voiceId = generateId('av');
            await run(env, `
              INSERT INTO artisan_voice (
                id, artisan_id, tone_style, self_intro_zh, self_intro_en,
                core_values, cultural_lineage, forbidden_topics, examples,
                model_config, enabled, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              voiceId,
              artisan_id,
              tone_style || 'warm',
              self_intro_zh || null,
              self_intro_en || null,
              core_values || null,
              cultural_lineage || null,
              forbidden_topics ? JSON.stringify(forbidden_topics) : null,
              examples ? JSON.stringify(examples) : null,
              model_config ? JSON.stringify(model_config) : null,
              enabled !== undefined ? (enabled ? 1 : 0) : 1,
              now,
              now
            ]);

            return withCors(
              jsonResponse({ ok: true, action: 'created', artisan_id, voice_id: voiceId }),
              pickAllowedOrigin(req)
            );
          }
        } catch (error) {
          console.error('Artisan voice upsert error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // GET /admin/artisan-voice/:artisan_id - 获取匠人 AI 配置
      if (pathname.startsWith("/admin/artisan-voice/") && req.method === "GET") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const artisan_id = pathname.split("/admin/artisan-voice/")[1];
          
          const rows = await query(env, `
            SELECT * FROM artisan_voice WHERE artisan_id = ?
          `, [artisan_id]);

          if (!rows || rows.length === 0) {
            return withCors(
              jsonResponse({ ok: true, exists: false, artisan_id }),
              pickAllowedOrigin(req)
            );
          }

          const voice = rows[0];
          
          // 解析 JSON 字段
          if (voice.forbidden_topics) {
            try {
              voice.forbidden_topics = JSON.parse(voice.forbidden_topics);
            } catch (e) {
              voice.forbidden_topics = [];
            }
          }
          if (voice.examples) {
            try {
              voice.examples = JSON.parse(voice.examples);
            } catch (e) {
              voice.examples = [];
            }
          }
          if (voice.model_config) {
            try {
              voice.model_config = JSON.parse(voice.model_config);
            } catch (e) {
              voice.model_config = {};
            }
          }

          return withCors(
            jsonResponse({ ok: true, exists: true, voice }),
            pickAllowedOrigin(req)
          );
        } catch (error) {
          console.error('Get artisan voice error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // POST /ai/artisan-agent/reply - AI 对话接口
      if (pathname === "/ai/artisan-agent/reply" && req.method === "POST") {
        try {
          const body = await readJson(req);
          const { artisan_id, question, lang = 'zh', session_id, user_id } = body;

          if (!artisan_id || !question) {
            return withCors(
              errorResponse("missing artisan_id or question", 400),
              pickAllowedOrigin(req)
            );
          }

          // 内容审核
          const moderation = moderateContent(question);
          if (moderation.flagged) {
            return withCors(
              jsonResponse({
                ok: false,
                error: 'content_moderation_failed',
                reason: moderation.reason
              }),
              pickAllowedOrigin(req)
            );
          }

          // 查询匠人信息
          const artisanRows = await query(env, `
            SELECT * FROM artisans WHERE id = ?
          `, [artisan_id]);

          if (!artisanRows || artisanRows.length === 0) {
            return withCors(errorResponse("artisan not found", 404), pickAllowedOrigin(req));
          }

          const artisan = artisanRows[0];

          // 查询 AI 配置
          const voiceRows = await query(env, `
            SELECT * FROM artisan_voice WHERE artisan_id = ? AND enabled = 1
          `, [artisan_id]);

          let voiceConfig = null;
          if (voiceRows && voiceRows.length > 0) {
            voiceConfig = voiceRows[0];
            
            // 解析 JSON 字段
            if (voiceConfig.forbidden_topics) {
              try {
                voiceConfig.forbidden_topics = JSON.parse(voiceConfig.forbidden_topics);
              } catch (e) {}
            }
            if (voiceConfig.examples) {
              try {
                voiceConfig.examples = JSON.parse(voiceConfig.examples);
              } catch (e) {}
            }
            if (voiceConfig.model_config) {
              try {
                voiceConfig.model_config = JSON.parse(voiceConfig.model_config);
              } catch (e) {}
            }
          } else {
            // 如果没有配置，使用默认值
            voiceConfig = {
              tone_style: 'warm',
              self_intro_zh: '我是一名传统匠人，专注于非遗技艺的传承与创新。',
              self_intro_en: 'I am a traditional artisan dedicated to preserving and innovating heritage crafts.',
              core_values: null,
              cultural_lineage: null,
              forbidden_topics: [],
              examples: [],
              model_config: {}
            };
          }

          // 构建 Prompt
          const systemPrompt = buildArtisanSystemPrompt(artisan, voiceConfig, lang);
          const messages = buildChatMessages(systemPrompt, voiceConfig, question);

          // 调用 AI（优先使用环境变量中的真实 API，否则使用 Mock）
          let aiResult;
          const artisanName = lang === 'zh' ? artisan.name_zh : artisan.name_en;

          if (env.OPENAI_API_KEY) {
            aiResult = await callOpenAI(env.OPENAI_API_KEY, messages, voiceConfig.model_config);
          } else if (env.ANTHROPIC_API_KEY) {
            aiResult = await callClaude(env.ANTHROPIC_API_KEY, messages, voiceConfig.model_config);
          } else {
            // 使用 Mock（开发测试）
            aiResult = await generateMockReply(question, artisanName, lang);
          }

          if (!aiResult.ok) {
            console.error('AI 调用失败:', aiResult.error);
            return withCors(
              jsonResponse({
                ok: false,
                error: 'ai_service_error',
                message: aiResult.error
              }),
              pickAllowedOrigin(req)
            );
          }

          // 记录对话日志
          const logId = generateId('log');
          const now = Math.floor(Date.now() / 1000);

          await run(env, `
            INSERT INTO artisan_agent_logs (
              id, artisan_id, user_id, session_id, question, answer, lang,
              model_used, tokens_used, response_time_ms, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            logId,
            artisan_id,
            user_id || null,
            session_id || null,
            question,
            aiResult.answer,
            lang,
            aiResult.model || 'mock',
            aiResult.tokensUsed || 0,
            aiResult.responseTime || 0,
            now
          ]);

          return withCors(
            jsonResponse({
              ok: true,
              answer: aiResult.answer,
              model: aiResult.model,
              log_id: logId
            }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('AI reply error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // POST /ai/artisan-agent/feedback - 用户反馈
      if (pathname === "/ai/artisan-agent/feedback" && req.method === "POST") {
        try {
          const body = await readJson(req);
          const { log_id, feedback, note } = body;

          if (!log_id || !feedback) {
            return withCors(
              errorResponse("missing log_id or feedback", 400),
              pickAllowedOrigin(req)
            );
          }

          await run(env, `
            UPDATE artisan_agent_logs 
            SET user_feedback = ?, feedback_note = ?
            WHERE id = ?
          `, [feedback, note || null, log_id]);

          return withCors(
            jsonResponse({ ok: true }),
            pickAllowedOrigin(req)
          );
        } catch (error) {
          console.error('AI feedback error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // GET /ai/artisan-agent/history/:artisan_id - 获取对话历史（分页）
      if (pathname.startsWith("/ai/artisan-agent/history/") && req.method === "GET") {
        try {
          const artisan_id = pathname.split("/ai/artisan-agent/history/")[1];
          const offset = parseInt(searchParams.get('offset') || '0', 10);
          const limit = parseInt(searchParams.get('limit') || '20', 10);

          const rows = await query(env, `
            SELECT id, question, answer, lang, created_at, user_feedback
            FROM artisan_agent_logs
            WHERE artisan_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
          `, [artisan_id, limit, offset]);

          return withCors(
            jsonResponse({
              ok: true,
              messages: rows || [],
              offset,
              limit
            }),
            pickAllowedOrigin(req)
          );
        } catch (error) {
          console.error('Get history error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // ============================================
      // 文化叙事生成 API (Sprint 4)
      // ============================================

      // POST /ai/narrative/generate - 生成文化叙事（支持多媒体）
      if (pathname === "/ai/narrative/generate" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const body = await readJson(req);
          const { 
            product_id, 
            types, 
            lang = 'zh', 
            provider = 'openai',
            generate_audio = false,
            generate_video = false,
            voice_style = null,
            video_style = null
          } = body;

          if (!product_id || !types || !Array.isArray(types)) {
            return withCors(
              errorResponse("missing product_id or types array", 400),
              pickAllowedOrigin(req)
            );
          }

          // 查询商品信息
          const productRows = await query(env, `
            SELECT p.*, a.id as artisan_id, a.name_zh, a.name_en, a.region
            FROM products_new p
            LEFT JOIN artisans a ON p.artisan_id = a.id
            WHERE p.id = ?
          `, [product_id]);

          if (!productRows || productRows.length === 0) {
            return withCors(errorResponse("product not found", 404), pickAllowedOrigin(req));
          }

          const productData = productRows[0];
          
          if (!productData.artisan_id) {
            return withCors(
              errorResponse("product has no associated artisan", 400),
              pickAllowedOrigin(req)
            );
          }

          const artisanData = {
            id: productData.artisan_id,
            name_zh: productData.name_zh,
            name_en: productData.name_en,
            region: productData.region
          };

          // 选择 AI 提供商
          const apiKey = provider === 'claude' ? env.ANTHROPIC_API_KEY : env.OPENAI_API_KEY;
          
          if (!apiKey) {
            return withCors(
              jsonResponse({
                ok: false,
                error: 'ai_not_configured',
                message: '未配置 AI API Key，请联系管理员'
              }),
              pickAllowedOrigin(req)
            );
          }

          // 生成多种叙事版本
          const results = await generateMultipleNarratives(
            apiKey,
            productData,
            artisanData,
            types,
            lang,
            provider
          );

          // 保存到数据库并生成多媒体
          const now = Math.floor(Date.now() / 1000);
          const savedNarratives = [];
          const multimediaResults = {};

          // 动态导入多媒体生成模块（仅在需要时）
          let generateMultimediaNarrative = null;
          if (generate_audio || generate_video) {
            try {
              const multimediaModule = await import('./utils/multimedia-generator.js');
              generateMultimediaNarrative = multimediaModule.generateMultimediaNarrative;
            } catch (error) {
              console.error('Failed to load multimedia generator:', error);
            }
          }

          for (const type of types) {
            if (results[type].ok) {
              const narrativeId = generateId('nrt');
              const narrativeText = results[type].content;
              
              const contentJson = JSON.stringify({
                type: type,
                content: narrativeText,
                model: results[type].model,
                tokens_used: results[type].tokensUsed,
                generated_at: now
              });

              // 生成多媒体内容
              let audioKey = null, audioUrl = null, audioDuration = 0, audioSize = 0;
              let videoKey = null, videoUrl = null, videoDuration = 0, videoSize = 0;
              let generationStatus = 'text_only';
              let generationProgress = { text: { status: 'completed', time: now } };

              if (generateMultimediaNarrative) {
                try {
                  const mmResult = await generateMultimediaNarrative({
                    narrativeText: narrativeText,
                    narrativeType: type,
                    narrativeId: narrativeId,
                    productName: productData.title_zh || productData.title_en || 'Product',
                    options: {
                      generateAudioFlag: generate_audio,
                      generateVideoFlag: generate_video,
                      voiceStyle: voice_style,
                      videoStyle: video_style
                    },
                    env: env
                  });

                  multimediaResults[type] = mmResult;

                  // 处理音频结果
                  if (mmResult.audio) {
                    if (mmResult.audio.status === 'completed') {
                      audioKey = mmResult.audio.key;
                      audioUrl = mmResult.audio.url;
                      audioDuration = mmResult.audio.duration;
                      audioSize = mmResult.audio.size;
                      generationProgress.audio = { status: 'completed', time: now, size: audioSize };
                    } else if (mmResult.audio.status === 'failed') {
                      generationProgress.audio = { status: 'failed', error: mmResult.audio.error };
                    }
                  }

                  // 处理视频结果
                  if (mmResult.video) {
                    if (mmResult.video.status === 'processing') {
                      generationProgress.video = { 
                        status: 'processing', 
                        task_id: mmResult.video.task_id 
                      };
                      generationStatus = 'processing';
                    } else if (mmResult.video.status === 'failed') {
                      generationProgress.video = { status: 'failed', error: mmResult.video.error };
                    }
                  }

                  if (generate_audio || generate_video) {
                    if (generationStatus === 'text_only') {
                      generationStatus = 'completed';
                    }
                  }
                } catch (error) {
                  console.error('Multimedia generation error:', error);
                  generationProgress.error = error.message;
                }
              }

              const progressJson = JSON.stringify(generationProgress);

              await run(env, `
                INSERT INTO content_variants (
                  id, product_id, type, content_json, lang, status,
                  created_by, version, created_at, updated_at,
                  audio_key, audio_url, audio_duration, audio_size,
                  video_key, video_url, video_duration, video_size,
                  generation_status, generation_progress
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                narrativeId,
                product_id,
                type,
                contentJson,
                lang,
                'draft',
                adminCheck.wallet,
                1,
                now,
                now,
                audioKey,
                audioUrl,
                audioDuration,
                audioSize,
                videoKey,
                videoUrl,
                videoDuration,
                videoSize,
                generationStatus,
                progressJson
              ]);

              savedNarratives.push({
                id: narrativeId,
                type: type,
                content: narrativeText,
                audio_url: audioUrl,
                video_url: videoUrl,
                generation_status: generationStatus
              });
            }
          }

          return withCors(
            jsonResponse({
              ok: true,
              narratives: savedNarratives,
              total: savedNarratives.length,
              results: results,
              multimedia_results: multimediaResults,
              message: generate_video ? '视频正在后台生成中，请稍后刷新查看' : null
            }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('Generate narrative error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // GET /ai/narrative/product/:product_id - 获取商品所有叙事版本
      if (pathname.startsWith("/ai/narrative/product/") && req.method === "GET") {
        try {
          const product_id = pathname.split("/ai/narrative/product/")[1];
          const lang = searchParams.get('lang') || 'zh';
          const status = searchParams.get('status') || 'all';

          let sql = `
            SELECT id, type, content_json, lang, status, version,
                   created_by, reviewed_by, review_notes,
                   view_count, like_count, created_at, updated_at, published_at
            FROM content_variants
            WHERE product_id = ? AND lang = ?
          `;
          const params = [product_id, lang];

          if (status !== 'all') {
            sql += ` AND status = ?`;
            params.push(status);
          }

          sql += ` ORDER BY created_at DESC`;

          const rows = await query(env, sql, params);

          const narratives = (rows || []).map(row => {
            let contentData = {};
            try {
              contentData = JSON.parse(row.content_json);
            } catch (e) {
              console.error('Parse content_json failed:', e);
            }

            return {
              id: row.id,
              type: row.type,
              content: contentData.content || '',
              model: contentData.model,
              tokens_used: contentData.tokens_used,
              lang: row.lang,
              status: row.status,
              version: row.version,
              created_by: row.created_by,
              reviewed_by: row.reviewed_by,
              review_notes: row.review_notes,
              view_count: row.view_count,
              like_count: row.like_count,
              created_at: row.created_at,
              updated_at: row.updated_at,
              published_at: row.published_at
            };
          });

          return withCors(
            jsonResponse({
              ok: true,
              product_id: product_id,
              narratives: narratives,
              total: narratives.length
            }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('Get narratives error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // POST /admin/narrative/review - 审核叙事内容
      if (pathname === "/admin/narrative/review" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const body = await readJson(req);
          const { narrative_id, action, notes } = body;

          if (!narrative_id || !action) {
            return withCors(
              errorResponse("missing narrative_id or action", 400),
              pickAllowedOrigin(req)
            );
          }

          if (!['approve', 'reject', 'archive'].includes(action)) {
            return withCors(
              errorResponse("action must be approve, reject, or archive", 400),
              pickAllowedOrigin(req)
            );
          }

          const now = Math.floor(Date.now() / 1000);
          const statusMap = {
            approve: 'published',
            reject: 'draft',
            archive: 'archived'
          };

          const newStatus = statusMap[action];
          const publishedAt = action === 'approve' ? now : null;

          await run(env, `
            UPDATE content_variants
            SET 
              status = ?,
              reviewed_by = ?,
              review_notes = ?,
              published_at = COALESCE(?, published_at),
              updated_at = ?
            WHERE id = ?
          `, [newStatus, adminCheck.wallet, notes || null, publishedAt, now, narrative_id]);

          return withCors(
            jsonResponse({
              ok: true,
              narrative_id: narrative_id,
              action: action,
              new_status: newStatus
            }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('Review narrative error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // DELETE /admin/narrative/:narrative_id - 删除叙事版本
      if (pathname.startsWith("/admin/narrative/") && req.method === "DELETE") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const narrative_id = pathname.split("/admin/narrative/")[1];

          await run(env, `DELETE FROM content_variants WHERE id = ?`, [narrative_id]);

          return withCors(
            jsonResponse({ ok: true, narrative_id: narrative_id }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('Delete narrative error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // ============================================
      // 内容审核管理 API (Sprint 5)
      // ============================================

      // GET /admin/moderation/queue - 获取审核队列
      if (pathname === "/admin/moderation/queue" && req.method === "GET") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const status = searchParams.get('status') || 'pending';
          const limit = parseInt(searchParams.get('limit') || '50', 10);
          const offset = parseInt(searchParams.get('offset') || '0', 10);

          const rows = await query(env, `
            SELECT * FROM ai_moderation_queue
            WHERE status = ?
            ORDER BY priority DESC, created_at DESC
            LIMIT ? OFFSET ?
          `, [status, limit, offset]);

          return withCors(
            jsonResponse({
              ok: true,
              queue: rows || [],
              total: rows?.length || 0,
              status: status
            }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('Get moderation queue error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // GET /admin/moderation/flagged-chats - 获取被标记的对话
      if (pathname === "/admin/moderation/flagged-chats" && req.method === "GET") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const reviewed = searchParams.get('reviewed') === 'true';
          const limit = parseInt(searchParams.get('limit') || '50', 10);
          const offset = parseInt(searchParams.get('offset') || '0', 10);

          const rows = await query(env, `
            SELECT 
              l.*,
              a.name_zh as artisan_name
            FROM artisan_agent_logs l
            LEFT JOIN artisans a ON l.artisan_id = a.id
            WHERE l.flagged = 1 AND l.reviewed = ?
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
          `, [reviewed ? 1 : 0, limit, offset]);

          return withCors(
            jsonResponse({
              ok: true,
              chats: rows || [],
              total: rows?.length || 0,
              reviewed: reviewed
            }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('Get flagged chats error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // POST /admin/moderation/review-chat - 审核对话
      if (pathname === "/admin/moderation/review-chat" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const body = await readJson(req);
          const { log_id, action, notes } = body;

          if (!log_id || !action) {
            return withCors(
              errorResponse("missing log_id or action", 400),
              pickAllowedOrigin(req)
            );
          }

          // action: approve (保留) / delete (删除)
          if (action === 'delete') {
            await run(env, `DELETE FROM artisan_agent_logs WHERE id = ?`, [log_id]);
          } else if (action === 'approve') {
            await run(env, `
              UPDATE artisan_agent_logs
              SET reviewed = 1, flag_reason = ?
              WHERE id = ?
            `, [notes || 'Reviewed and approved', log_id]);
          }

          return withCors(
            jsonResponse({
              ok: true,
              log_id: log_id,
              action: action
            }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('Review chat error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // POST /admin/moderation/batch-review - 批量审核
      if (pathname === "/admin/moderation/batch-review" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        try {
          const body = await readJson(req);
          const { log_ids, action } = body;

          if (!log_ids || !Array.isArray(log_ids) || !action) {
            return withCors(
              errorResponse("missing log_ids array or action", 400),
              pickAllowedOrigin(req)
            );
          }

          let processed = 0;
          for (const log_id of log_ids) {
            try {
              if (action === 'delete') {
                await run(env, `DELETE FROM artisan_agent_logs WHERE id = ?`, [log_id]);
              } else if (action === 'approve') {
                await run(env, `
                  UPDATE artisan_agent_logs
                  SET reviewed = 1, flag_reason = 'Batch approved'
                  WHERE id = ?
                `, [log_id]);
              }
              processed++;
            } catch (e) {
              console.error(`Failed to process log_id ${log_id}:`, e);
            }
          }

          return withCors(
            jsonResponse({
              ok: true,
              processed: processed,
              total: log_ids.length
            }),
            pickAllowedOrigin(req)
          );

        } catch (error) {
          console.error('Batch review error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // ---------------- 传承人 / 匠人 ----------------
      // POST /admin/artisan-upsert
      if (pathname === "/admin/artisan-upsert" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));

        const body = await readJson(req);
        if (!body || !body.wallet || !body.name_zh) {
          return withCors(errorResponse("missing required fields wallet/name_zh", 400), pickAllowedOrigin(req));
        }

        const id = body.id || genId();

        await run(env, `
          INSERT INTO artisans (
            id,
            wallet,
            name_zh,
            name_en,
            bio,
            region,
            verified,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
          ON CONFLICT(id) DO UPDATE SET
            wallet=excluded.wallet,
            name_zh=excluded.name_zh,
            name_en=excluded.name_en,
            bio=excluded.bio,
            region=excluded.region,
            verified=excluded.verified,
            updated_at=strftime('%s','now')
        `, [
          id,
          body.wallet,
          body.name_zh,
          body.name_en || "",
          body.bio || "",
          body.region || "",
          body.verified ? 1 : 0
        ]);

        return withCors(jsonResponse({ ok: true, id }), pickAllowedOrigin(req));
      }

      // GET /artisans (公开接口)
      if (pathname === "/artisans" && req.method === "GET") {
        const rows = await query(env, `
          SELECT
            id,
            wallet,
            name_zh,
            name_en,
            bio,
            region,
            verified,
            created_at,
            updated_at
          FROM artisans
          WHERE verified = 1
          ORDER BY updated_at DESC
        `);

        return withCors(jsonResponse({ ok: true, artisans: rows }), pickAllowedOrigin(req));
      }

      // GET /admin/artisans (管理员接口)
      if (pathname === "/admin/artisans" && req.method === "GET") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));

        const rows = await query(env, `
          SELECT
            id,
            wallet,
            name_zh,
            name_en,
            bio,
            region,
            verified,
            created_at,
            updated_at
          FROM artisans
          ORDER BY updated_at DESC
        `);
        return withCors(jsonResponse({ ok: true, artisans: rows }), pickAllowedOrigin(req));
      }

      // ---------------- 事件管理 ----------------
      // POST /admin/event-upsert
      if (pathname === "/admin/event-upsert" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        const body = await readJson(req);
        // 前端传：slug, title, start_ts?, end_ts?
        // 我们的数据库当前结构：events(id, slug, name, location, start_time, poap_contract, chain_id, created_at, ...)
        // 对应关系：
        // - title      -> name
        // - start_ts   -> start_time（转成人类可读字符串）
        // - slug       -> slug
        //
        // 注意：不要引用 events 表里并不存在的列，比如 updated_at / start_ts / end_ts

        if (!body || !body.slug || !body.title) {
          return withCors(
            errorResponse("missing required fields slug/title", 400),
            pickAllowedOrigin(req)
          );
        }

        const nowSec = Math.floor(Date.now() / 1000);
        const eventSlug = body.slug.trim();
        const eventTitle = body.title.trim();

        // 生成 start_time 的字符串（如果传了 start_ts 就格式化，否则给个默认文案）
        let startTimeStr = "即刻起";
        if (body.start_ts) {
          const tsNum = Number(body.start_ts);
          if (!isNaN(tsNum)) {
            const d = new Date(tsNum * 1000);
            startTimeStr = d.toLocaleString("zh-CN", { hour12: false });
          }
        }

        // 查是否已存在同 slug 的活动
        const existingRows = await query(env, `
          SELECT id
          FROM events
          WHERE slug = ?
          LIMIT 1
        `, [eventSlug]);

        if (existingRows && existingRows.length > 0) {
          // 已存在：更新标题、开始时间等
          const existingId = existingRows[0].id;

          await run(env, `
            UPDATE events
            SET name = ?,
                start_time = ?,
                created_at = COALESCE(created_at, ?)
            WHERE id = ?
          `, [
            eventTitle,
            startTimeStr,
            nowSec,
            existingId
          ]);

          return withCors(
            jsonResponse({
              ok: true,
              id: existingId,
              slug: eventSlug,
              static_code: eventSlug // 先用 slug 当签到码
            }),
            pickAllowedOrigin(req)
          );
        } else {
          // 不存在：插入新活动（id是自增的INTEGER，不需要手动指定）
          // 注意：poap_contract字段有NOT NULL约束，必须提供默认值
          const defaultContract = "0xBBEd6739c0250F9C4e0e48D5BAAa68B4b1F94222"; // Base Sepolia测试合约

          await run(env, `
            INSERT INTO events (
              slug,
              name,
              start_time,
              location,
              poap_contract,
              chain_id,
              created_by,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            eventSlug,
            eventTitle,
            startTimeStr,
            body.location || null,
            body.poap_contract || defaultContract,
            body.chain_id || null,
            adminCheck.wallet || null,
            nowSec
          ]);

          // 获取新插入的ID
          const newRows = await query(env, `SELECT id FROM events WHERE slug = ? LIMIT 1`, [eventSlug]);
          const newId = newRows && newRows[0] ? newRows[0].id : null;

          return withCors(
            jsonResponse({
              ok: true,
              id: newId,
              slug: eventSlug,
              static_code: eventSlug
            }),
            pickAllowedOrigin(req)
          );
        }
      }

      // GET /events/get - 获取单个活动详情（按slug）
      if (path === 'events/get' && req.method === 'GET') {
        const slug = searchParams.get('slug');
        if (!slug) {
          return withCors(
            errorResponse('missing slug parameter', 400),
            pickAllowedOrigin(req)
          );
        }

        try {
          const rows = await query(env, `
            SELECT id, slug, name, location, start_time, poap_contract, chain_id, created_at
            FROM events
            WHERE slug = ?
            LIMIT 1
          `, [slug]);

          if (!rows || !rows.length) {
            return withCors(
              errorResponse('event not found', 404),
              pickAllowedOrigin(req)
            );
          }

          return withCors(
            jsonResponse({ ok: true, event: rows[0] }),
            pickAllowedOrigin(req)
          );
        } catch (error) {
          console.error("Error fetching event:", error);
          return withCors(
            errorResponse("Failed to fetch event: " + error.message, 500),
            pickAllowedOrigin(req)
          );
        }
      }

      // GET /poap/events - 获取活动列表（公开端点）
      if (pathname === "/poap/events" && req.method === "GET") {
        try {
          const rows = await query(env, `
            SELECT id, slug, name, location, start_time, poap_contract, created_at
            FROM events
            ORDER BY created_at DESC
            LIMIT 50
          `);

          return withCors(
            jsonResponse({ ok: true, events: rows || [] }),
            pickAllowedOrigin(req)
          );
        } catch (error) {
          console.error("Error fetching events:", error);
          return withCors(
            errorResponse("Failed to fetch events: " + error.message, 500),
            pickAllowedOrigin(req)
          );
        }
      }

      // GET /admin/event-code
      if (pathname === "/admin/event-code" && req.method === "GET") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        }

        const eventSlug = searchParams.get("event_slug");
        if (!eventSlug) {
          return withCors(errorResponse("missing event_slug", 400), pickAllowedOrigin(req));
        }

        // 从 events 里查对应活动
        const rows = await query(env, `
          SELECT id, slug, name
          FROM events
          WHERE slug = ?
          LIMIT 1
        `, [eventSlug]);

        if (!rows || !rows.length) {
          return withCors(
            errorResponse("event not found", 404),
            pickAllowedOrigin(req)
          );
        }

        // 暂时用 slug 作为固定签到码
        const staticCode = rows[0].slug;

        return withCors(
          jsonResponse({
            ok: true,
            slug: rows[0].slug,
            static_code: staticCode,
            id: rows[0].id
          }),
          pickAllowedOrigin(req)
        );
      }
      // ---------------- 商品 ----------------
      // POST /admin/product-upsert
      if (pathname === "/admin/product-upsert" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));

        const body = await readJson(req);
        if (
          !body ||
          !body.artisan_id ||
          !body.slug ||
          !body.title_zh ||
          !body.price_native ||
          !body.price_currency
        ) {
          return errorResponse(
            "missing required fields artisan_id/slug/title_zh/price_native/price_currency",
            400
          );
        }

        const id = body.id || genId();

        await run(env, `
          INSERT INTO products_new (
            id,
            artisan_id,
            slug,
            title_zh,
            title_en,
            desc_md,
            image_key,
            price_native,
            price_currency,
            price_points,
            stock,
            badge_contract,
            created_at,
            updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now')
          )
          ON CONFLICT(id) DO UPDATE SET
            artisan_id=excluded.artisan_id,
            slug=excluded.slug,
            title_zh=excluded.title_zh,
            title_en=excluded.title_en,
            desc_md=excluded.desc_md,
            image_key=excluded.image_key,
            price_native=excluded.price_native,
            price_currency=excluded.price_currency,
            price_points=excluded.price_points,
            stock=excluded.stock,
            badge_contract=excluded.badge_contract,
            updated_at=strftime('%s','now')
        `, [
          id,
          body.artisan_id,
          body.slug,
          body.title_zh,
          body.title_en || "",
          body.desc_md || "",
          body.image_key || "",
          Number(body.price_native),
          body.price_currency,
          body.price_points ? Number(body.price_points) : 0,
          body.stock ? Number(body.stock) : 0,
          body.badge_contract || ""
        ]);

        return withCors(jsonResponse({ ok: true, id }), pickAllowedOrigin(req));
      }

      // GET /products
      if (pathname === "/products" && req.method === "GET") {
        const rows = await query(env, `
          SELECT
            p.id,
            p.artisan_id,
            p.slug,
            p.title_zh,
            p.title_en,
            p.desc_md,
            p.image_key,
            p.price_native,
            p.price_currency,
            p.price_points,
            p.stock,
            p.badge_contract,
            a.name_zh AS artisan_name_zh,
            a.region  AS artisan_region,
            p.updated_at
          FROM products_new p
          LEFT JOIN artisans a ON p.artisan_id = a.id
          ORDER BY p.updated_at DESC
        `);

        return withCors(
          jsonResponse({ ok: true, products: rows }),
          pickAllowedOrigin(req)
        );
      }

      // POST /admin/upload-image
      if (pathname === "/admin/upload-image" && req.method === "POST") {
        return await handleUploadImage(req, env);
      }

      // GET /image/:key - 获取R2存储的图片
      if (pathname.startsWith("/image/") && req.method === "GET") {
        const key = pathname.slice(7); // 去掉 "/image/"
        if (!key) {
          return withCors(errorResponse("missing image key", 400), pickAllowedOrigin(req));
        }

        try {
          if (!env.R2_BUCKET) {
            return withCors(errorResponse("R2_BUCKET not configured", 500), pickAllowedOrigin(req));
          }

          const object = await env.R2_BUCKET.get(key);
          if (!object) {
            return withCors(errorResponse("image not found", 404), pickAllowedOrigin(req));
          }

          // 返回图片
          return new Response(object.body, {
            headers: {
              'Content-Type': object.httpMetadata.contentType || 'image/jpeg',
              'Cache-Control': 'public, max-age=31536000',
              'Access-Control-Allow-Origin': pickAllowedOrigin(req),
            },
          });
        } catch (error) {
          console.error("Get image error:", error);
          return withCors(errorResponse(`get image failed: ${error.message}`, 500), pickAllowedOrigin(req));
        }
      }

      // ---------------- 下单 ----------------
      // POST /order/create
      if (pathname === "/order/create" && req.method === "POST") {
        const userCheck = await requireUser(req, env);
        if (!userCheck.ok) {
          return withCors(
            errorResponse("not allowed", 403),
            pickAllowedOrigin(req)
          );
        }

        const body = await readJson(req);
        // body 里我们前端传的是:
        // { product_id, qty, shipping_info {name, phone, address} }
        if (!body || !body.product_id || !body.qty || !body.shipping_info) {
          return withCors(
            errorResponse("missing required fields product_id/qty/shipping_info", 400),
            pickAllowedOrigin(req)
          );
        }

        // 查库存
        const productRows = await query(env, `
          SELECT id, stock
          FROM products_new
          WHERE id = ?
        `, [body.product_id]);
        if (!productRows || !productRows.length) {
          return withCors(
            errorResponse("product not found", 404),
            pickAllowedOrigin(req)
          );
        }
        const product = productRows[0];
        if (Number(product.stock) < Number(body.qty)) {
          return withCors(
            errorResponse("not enough stock", 400),
            pickAllowedOrigin(req)
          );
        }

        const orderNo = genId(); // 我们仍用 genId() 作为 order_no
        const encShip = await encryptShipping(body.shipping_info, env);
        const nowSec = Math.floor(Date.now() / 1000);

        // 插入订单，字段对应我们刚才扩展过的 orders 表
        await run(env, `
          INSERT INTO orders (
            order_no,
            wallet,
            product_id,
            qty,
            shipping_enc,
            amount_wei,
            chain,
            tx_hash,
            status,
            created_at,
            updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `, [
          orderNo,
          userCheck.wallet,
          body.product_id,
          Number(body.qty),
          encShip,
          "0",           // amount_wei: 之后可以记录真实支付金额
          "offchain",    // chain: 线下/微信转账/现场支付的占位
          "",
          "pending",
          nowSec,
          nowSec
        ]);

        return withCors(
          jsonResponse({
            ok: true,
            order_id: orderNo,
            status: "pending"
          }),
          pickAllowedOrigin(req)
        );
      }

      // GET /orders
      if (pathname === "/orders" && req.method === "GET") {
        const walletQ = searchParams.get("wallet");

        // 身份判定：管理员 sees all / 用户 sees self
        const adminCheck = await requireAdmin(req, env);
        let isAdmin = false;
        let requesterWallet = null;
        if (adminCheck.ok) {
          isAdmin = true;
        } else {
          const userCheck = await requireUser(req, env);
          if (!userCheck.ok) {
            return withCors(
              errorResponse("not allowed", 403),
              pickAllowedOrigin(req)
            );
          }
          requesterWallet = userCheck.wallet;
        }

        let rows;
        if (isAdmin && !walletQ) {
          rows = await query(env, `
            SELECT
              o.order_no,
              o.wallet AS buyer_wallet,
              o.product_id,
              o.qty,
              o.status,
              o.tx_hash,
              o.created_at,
              o.updated_at,
              p.title_zh,
              p.slug
            FROM orders o
            LEFT JOIN products_new p ON o.product_id = p.id
            ORDER BY o.created_at DESC
          `);
    } else {
          const targetWallet = walletQ || requesterWallet;
          rows = await query(env, `
            SELECT
              o.order_no,
              o.wallet AS buyer_wallet,
              o.product_id,
              o.qty,
              o.status,
              o.tx_hash,
              o.created_at,
              o.updated_at,
              p.title_zh,
              p.slug
            FROM orders o
            LEFT JOIN products_new p ON o.product_id = p.id
            WHERE LOWER(o.wallet) = LOWER(?)
            ORDER BY o.created_at DESC
          `, [targetWallet]);
        }

        // 转成前端 `/orders/index.html` 期望的字段名
        const shaped = rows.map(r => ({
          id: r.order_no,
          buyer_wallet: r.buyer_wallet,
          qty: r.qty,
          status: r.status,
          tx_hash: r.tx_hash || "",
          created_at: r.created_at && !isNaN(r.created_at)
            ? new Date(Number(r.created_at) * 1000).toISOString()
            : "",
          updated_at: r.updated_at && !isNaN(r.updated_at)
            ? new Date(Number(r.updated_at) * 1000).toISOString()
            : "",
          title_zh: r.title_zh || "",
          slug: r.slug || ""
        }));

        return withCors(
          jsonResponse({ ok: true, orders: shaped }),
          pickAllowedOrigin(req)
        );
      }

      // POST /admin/order-status
      if (pathname === "/admin/order-status" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));

        const body = await readJson(req);
        // body: { order_id, status, tx_hash(optional) }
        // order_id = order_no（前端传的就是你在列表看到的 ID）
        if (!body || !body.order_id || !body.status) {
          return withCors(errorResponse("missing order_id/status", 400), pickAllowedOrigin(req));
        }

        const nowSec = Math.floor(Date.now() / 1000);

        await run(env, `
          UPDATE orders
          SET status = ?,
              tx_hash = COALESCE(?, tx_hash),
              updated_at = ?
          WHERE order_no = ?
        `, [
          body.status,
          body.tx_hash || null,
          nowSec,
          body.order_id
        ]);

        // 如果状态被改成 completed，就生成/刷新徽章领取签名包
        if (body.status === "completed") {
          const badgePrep = await ensureBadgeIssueForOrder(env, body.order_id);
          return withCors(jsonResponse({ ok: true, badgePrep }), pickAllowedOrigin(req));
        }

        return withCors(jsonResponse({ ok: true }), pickAllowedOrigin(req));
      }

      // GET /badge/claim-ticket
      if (pathname === "/badge/claim-ticket" && req.method === "GET") {
        const userCheck = await requireUser(req, env);
        if (!userCheck.ok) {
          return withCors(
            errorResponse("not allowed", 403),
            pickAllowedOrigin(req)
          );
        }

        const orderId = searchParams.get("order_id");
        if (!orderId) {
          return withCors(
            errorResponse("missing order_id", 400),
            pickAllowedOrigin(req)
          );
        }

        const rows = await query(env, `
          SELECT
            b.order_id,
            b.buyer_wallet,
            b.token_id,
            b.contract_addr,
            b.sig_payload,
            b.claimed,
            o.status AS order_status
          FROM badges_issues b
          LEFT JOIN orders o ON b.order_id = o.order_no
          WHERE b.order_id = ?
          LIMIT 1
        `, [orderId]);

        if (!rows || !rows.length) {
          return withCors(
            errorResponse("badge not ready yet", 404),
            pickAllowedOrigin(req)
          );
        }

        const row = rows[0];
        if (row.buyer_wallet.toLowerCase() !== userCheck.wallet.toLowerCase()) {
          return withCors(
            errorResponse("not your order", 403),
            pickAllowedOrigin(req)
          );
        }
        if (row.order_status !== "completed") {
          return withCors(
            errorResponse("order not completed", 400),
            pickAllowedOrigin(req)
          );
        }

        return withCors(
          jsonResponse({
            ok: true,
            badge: {
              order_id: row.order_id,
              token_id: row.token_id,
              contract_addr: row.contract_addr,
              claimed: row.claimed,
              payload: JSON.parse(row.sig_payload || "{}")
            }
          }),
          pickAllowedOrigin(req)
        );
      }

      // GET /points - 获取用户积分
      if (pathname === "/points" && req.method === "GET") {
        const userCheck = await requireUser(req, env);
        if (!userCheck.ok) {
          return withCors(
            errorResponse("not allowed", 403),
            pickAllowedOrigin(req)
          );
        }

        try {
          // 获取用户总积分
          const totalRows = await query(env, `
            SELECT COALESCE(SUM(points), 0) as total_points
            FROM rewards 
            WHERE wallet = ?
          `, [userCheck.wallet]);

          // 获取积分历史记录
          const historyRows = await query(env, `
            SELECT type, points, meta, ts, created_at
            FROM rewards 
            WHERE wallet = ?
            ORDER BY ts DESC
            LIMIT 10
          `, [userCheck.wallet]);

          const totalPoints = totalRows[0]?.total_points || 0;
          const history = historyRows.map(row => ({
            type: row.type || 'unknown',
            points: row.points || 0,
            description: row.meta ? JSON.parse(row.meta).description || '积分奖励' : '积分奖励',
            timestamp: row.ts || row.created_at
          }));

          return withCors(
            jsonResponse({ 
              ok: true, 
              points: totalPoints,
              history: history
            }),
            pickAllowedOrigin(req)
          );
        } catch (error) {
          console.error('获取积分失败:', error);
          return withCors(
            errorResponse("获取积分失败", 500),
            pickAllowedOrigin(req)
          );
        }
      }

      // GET /badge/list - 获取用户所有徽章
      if (pathname === "/badge/list" && req.method === "GET") {
        const userCheck = await requireUser(req, env);
        if (!userCheck.ok) {
          return withCors(
            errorResponse("not allowed", 403),
            pickAllowedOrigin(req)
          );
        }

        try {
          const rows = await query(env, `
            SELECT 
              b.id,
              b.order_id,
              b.token_id,
              b.contract_addr,
              b.claimed,
              b.created_at,
              o.status as order_status,
              p.title_zh as product_title
            FROM badges_issues b
            LEFT JOIN orders o ON b.order_id = o.order_no
            LEFT JOIN products_new p ON o.product_id = p.id
            WHERE b.buyer_wallet = ?
            ORDER BY b.created_at DESC
          `, [userCheck.wallet]);

          const badges = rows.map(row => ({
            id: row.id,
            title: row.product_title || `订单 ${row.order_id} 徽章`,
            type: 'NFT',
            claimed: row.claimed === 1,
            created_at: row.created_at,
            order_id: row.order_id,
            token_id: row.token_id,
            contract_addr: row.contract_addr
          }));

          return withCors(
            jsonResponse({ 
              ok: true, 
              badges: badges
            }),
            pickAllowedOrigin(req)
          );
        } catch (error) {
          console.error('获取徽章列表失败:', error);
          return withCors(
            errorResponse("获取徽章列表失败", 500),
            pickAllowedOrigin(req)
          );
        }
      }

      // 保留原有的 POAP 相关路由
      // GET /poap/events
      if (path === 'poap/events' && req.method === 'GET') {
        // 只有管理员可以查看活动列表（前端会在加载前 ensureAuth）
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) {
          return json(env, { ok: false, error: 'NOT_ADMIN' }, 403);
        }

        const rows = await query(env, `
          SELECT
            id,
            slug,
            name,
            start_time,
            location,
            created_at
          FROM events
          ORDER BY created_at DESC
          LIMIT 200
        `);

        // 适配前端 displayEvents() 预期字段
        const mapped = rows.map(r => {
          const fakeStartTs = r.created_at || 0; // 用 created_at 近似 start_ts
          return {
            id: r.id,
            slug: r.slug,
            name: r.name,
            created_at: r.created_at,
            start_ts: fakeStartTs
          };
        });

        return json(env, { ok: true, events: mapped });
      }

      // POST /poap/events
      if (path === 'poap/events' && req.method === 'POST') {
    const addr = readBearerAddr(req);
        if (!addr) return json(env, { ok: false, error: 'NO_TOKEN' }, 401);
        if (!checkAdmin(addr, env)) return json(env, { ok: false, error: 'NOT_ADMIN' }, 403);

        const body = await readJson(req);
        if (!body || !body.name) return json(env, { ok: false, error: 'MISSING_NAME' }, 400);

        const id = genId();
        await run(env, `
          INSERT INTO events (id, name, start_at, end_at, start_ts, end_ts, location, poap_contract, chain_id, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s','now'))
        `, [
          id, body.name, body.start_at || null, body.end_at || null,
          body.start_ts || null, body.end_ts || null, body.location || null,
          body.poap_contract || null, body.chain_id || null, addr
        ]);

        return json(env, { ok: true, id });
      }

      // GET /poap/checkin
      if (path === 'poap/checkin' && req.method === 'GET') {
        const eventId = url.searchParams.get('event_id');
        const code = url.searchParams.get('code');
        if (!eventId) return json(env, { ok: false, error: 'MISSING_EVENT_ID' }, 400);

        const rows = await query(env, `
          SELECT id, event_id, wallet, code, token_id, sig, tx_hash, created_at
          FROM checkins 
          WHERE event_id = ? AND code = ?
          ORDER BY created_at DESC
        `, [eventId, code || '']);

        return json(env, { ok: true, checkins: rows });
      }

      // POST /poap/checkin
      if (path === 'poap/checkin' && req.method === 'POST') {
        const body = await readJson(req);
        
        // 支持两种参数格式：slug或event_id
        const slug = body.slug;
        const eventId = body.event_id;
        const wallet = (body.address || body.wallet || '').toLowerCase();
        const code = (body.code || '').toUpperCase();

        if (!wallet) {
          return withCors(
            jsonResponse({ ok: false, error: 'MISSING_WALLET' }),
            pickAllowedOrigin(req)
          );
        }

        if (!slug && !eventId) {
          return withCors(
            jsonResponse({ ok: false, error: 'MISSING_EVENT_ID_OR_SLUG' }),
            pickAllowedOrigin(req)
          );
        }

        try {
          // 如果有slug但没有eventId，需要先查找eventId
          let actualEventId = eventId;
          let actualSlug = slug;

          if (slug && !eventId) {
            const eventRows = await query(env, `
              SELECT id, slug FROM events WHERE slug = ? LIMIT 1
            `, [slug]);

            if (!eventRows || !eventRows.length) {
              return withCors(
                jsonResponse({ ok: false, error: 'EVENT_NOT_FOUND' }),
                pickAllowedOrigin(req)
              );
            }

            actualEventId = eventRows[0].id;
            actualSlug = eventRows[0].slug;
          }

          // 检查今天是否已经签到
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const todayCheckin = await query(env, `
            SELECT id, created_at FROM checkins 
            WHERE event_id = ? AND wallet = ? 
            AND DATE(created_at) = DATE('now')
            LIMIT 1
          `, [actualEventId, wallet]);

          if (todayCheckin && todayCheckin.length > 0) {
            return withCors(
              jsonResponse({ 
                ok: false, 
                error: 'ALREADY_CHECKED_IN_TODAY',
                message: '您今天已经签到过了，请明天再来！',
                nextCheckinTime: new Date(new Date(todayCheckin[0].created_at).getTime() + 24*60*60*1000).toISOString()
              }),
              pickAllowedOrigin(req)
            );
          }

          // 查询历史签到次数
          const checkinHistory = await query(env, `
            SELECT COUNT(*) as total_checkins FROM checkins 
            WHERE event_id = ? AND wallet = ?
          `, [actualEventId, wallet]);
          
          const totalCheckins = (checkinHistory && checkinHistory[0]) ? checkinHistory[0].total_checkins : 0;

          const id = genId();
          const ts = Math.floor(Date.now() / 1000);
          await run(env, `
            INSERT INTO checkins (event_id, wallet, code)
            VALUES (?, ?, ?)
          `, [actualEventId, wallet, code]);

          // ✅ 添加积分奖励（每次签到 10 积分）
          const CHECKIN_POINTS = 10;
          await run(env, `
            INSERT INTO rewards (wallet, type, points, meta, ts)
            VALUES (?, 'checkin', ?, ?, strftime('%s', 'now'))
          `, [
            wallet.toLowerCase(),
            CHECKIN_POINTS,
            JSON.stringify({
              description: `活动签到: ${actualSlug || actualEventId} (第${totalCheckins + 1}次)`,
              event_id: actualEventId,
              checkin_id: id,
              checkin_date: today
            })
          ]);

          // ✅ 记录空投资格（每次签到 1000 个代币，累加）
          const AIRDROP_AMOUNT_PER_CHECKIN = "1000000000000000000000"; // 1000 tokens = 1000 * 10^18 wei
          
          // 查询现有空投资格
          const existingAirdrop = await query(env, `
            SELECT amount, checkin_count FROM airdrop_eligible
            WHERE wallet = ? AND event_id = ?
          `, [wallet.toLowerCase(), actualEventId]);
          
          let newAmount = AIRDROP_AMOUNT_PER_CHECKIN;
          let newCheckinCount = 1;
          
          if (existingAirdrop && existingAirdrop.length > 0) {
            // 累加代币数量
            const currentAmount = BigInt(existingAirdrop[0].amount || "0");
            const addAmount = BigInt(AIRDROP_AMOUNT_PER_CHECKIN);
            newAmount = (currentAmount + addAmount).toString();
            newCheckinCount = (existingAirdrop[0].checkin_count || 0) + 1;
          }
          
          await run(env, `
            INSERT INTO airdrop_eligible (wallet, event_id, amount, claimed, checkin_count, last_checkin_date, created_at)
            VALUES (?, ?, ?, 0, 1, DATE('now'), strftime('%s', 'now'))
            ON CONFLICT(wallet, event_id) DO UPDATE SET 
              amount = ?,
              checkin_count = ?,
              last_checkin_date = DATE('now')
          `, [
            wallet.toLowerCase(),
            actualEventId,
            AIRDROP_AMOUNT_PER_CHECKIN,
            newAmount,
            newCheckinCount
          ]);

          return withCors(
            jsonResponse({ 
              ok: true, 
              id, 
              ts, 
              points: CHECKIN_POINTS, 
              eligible: true,
              totalCheckins: totalCheckins + 1,
              totalTokens: newAmount,
              tokensPerCheckin: AIRDROP_AMOUNT_PER_CHECKIN,
              message: `签到成功！这是您的第 ${totalCheckins + 1} 次签到，累计可领取 ${(BigInt(newAmount) / BigInt(10**18)).toString()} 枚代币`
            }),
            pickAllowedOrigin(req)
          );
        } catch (error) {
          console.error('Checkin error:', error);
          return withCors(
            jsonResponse({ ok: false, error: error.message }),
            pickAllowedOrigin(req)
          );
        }
      }

      // GET /rewards/v2/eligibility/{batch}/{wallet} - 查询空投资格
      if (pathname.startsWith("/rewards/v2/eligibility/") && req.method === "GET") {
        const parts = pathname.split("/");
        // 路径: /rewards/v2/eligibility/{batch}/{wallet}
        // parts: ["", "rewards", "v2", "eligibility", "{batch}", "{wallet}"]
        if (parts.length !== 6) {
          return withCors(errorResponse("invalid path", 400), pickAllowedOrigin(req));
        }
        
        const batchInput = decodeURIComponent(parts[4]); // event_id 或 slug
        const wallet = decodeURIComponent(parts[5]).toLowerCase();
        
        // 如果 batchInput 不是纯数字，尝试通过 slug 查找 event_id
        let eventId = batchInput;
        if (isNaN(parseInt(batchInput))) {
          // 是 slug，需要查询 events 表获取数字 id
          const eventRows = await query(env, `
            SELECT id FROM events WHERE slug = ? LIMIT 1
          `, [batchInput]);
          
          if (!eventRows || !eventRows.length) {
            return withCors(jsonResponse({ 
              ok: false, 
              error: "EVENT_NOT_FOUND",
              message: `Event with slug '${batchInput}' not found`
            }), pickAllowedOrigin(req));
          }
          
          eventId = eventRows[0].id;
        }
        
        // 查询空投资格（使用 LIKE 处理 "25" vs "25.0" 的情况）
        const rows = await query(env, `
          SELECT wallet, event_id, amount, merkle_amount, claimed, item_index, proof, merkle_batch, token_tx_hash, checkin_count
          FROM airdrop_eligible
          WHERE (event_id = ? OR event_id = ? || '.0') AND wallet = ?
          LIMIT 1
        `, [String(eventId), String(eventId), wallet]);
        
        if (!rows || !rows.length) {
          return withCors(jsonResponse({ 
            ok: true, 
            eligible: false,
            reason: "NO_QUALIFICATION"
          }), pickAllowedOrigin(req));
        }
        
        const row = rows[0];
        
        if (row.claimed) {
          return withCors(jsonResponse({ 
            ok: true, 
            eligible: true,
            claimed: true,
            message: "Already claimed"
          }), pickAllowedOrigin(req));
        }
        
        if (!row.item_index || !row.proof) {
          return withCors(jsonResponse({ 
            ok: true, 
            eligible: true,
            ready: false,
            message: "Merkle proof not generated yet, contact admin"
          }), pickAllowedOrigin(req));
        }
        
        // 使用 merkle_amount（Merkle Tree 快照金额）而不是 amount（累加金额）
        const claimableAmount = row.merkle_amount || row.amount;
        
        return withCors(jsonResponse({ 
          ok: true,
          eligible: true,
          ready: true,
          index: row.item_index,
          amount: claimableAmount,  // 返回可领取金额（Merkle Tree 中的金额）
          totalAmount: row.amount,   // 返回累计总金额（仅供显示）
          checkinCount: row.checkin_count || 0,  // 签到次数
          proof: JSON.parse(row.proof || "[]"),
          batch: row.merkle_batch,
          note: row.merkle_amount ? "本次可领取基于 Merkle Tree 快照的金额" : null
        }), pickAllowedOrigin(req));
      }

      // POST /admin/generate-merkle - 生成 Merkle Tree（管理员）
      if (pathname === "/admin/generate-merkle" && req.method === "POST") {
        const adminCheck = await requireAdmin(req, env);
        if (!adminCheck.ok) return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
        
        const body = await readJson(req);
        const eventInput = body.event_id || body.batch_id;
        
        if (!eventInput) {
          return withCors(errorResponse("missing event_id", 400), pickAllowedOrigin(req));
        }
        
        try {
          // 如果 eventInput 不是纯数字，尝试通过 slug 查找 event_id
          let eventId = eventInput;
          if (isNaN(parseInt(eventInput))) {
            // 是 slug，需要查询 events 表获取数字 id
            const eventRows = await query(env, `
              SELECT id FROM events WHERE slug = ? LIMIT 1
            `, [eventInput]);
            
            if (!eventRows || !eventRows.length) {
              return withCors(errorResponse(`Event with slug '${eventInput}' not found`, 404), pickAllowedOrigin(req));
            }
            
            eventId = eventRows[0].id;
          }
          
          // 从数据库获取所有签到用户
          const checkins = await query(env, `
            SELECT DISTINCT wallet
            FROM checkins
            WHERE event_id = ?
            ORDER BY created_at
          `, [eventId]);
          
          if (!checkins || checkins.length === 0) {
            return withCors(errorResponse("no checkins found for this event", 404), pickAllowedOrigin(req));
          }
          
          const addresses = checkins.map(c => c.wallet);
          const amount = "1000000000000000000000"; // 1000 tokens (18 decimals)
          
          // 简化的 Merkle Root 计算（使用 Web Crypto API）
          const encoder = new TextEncoder();
          const data = encoder.encode(JSON.stringify({ eventId, addresses, amount }));
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const simpleRoot = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          // 为每个用户分配索引和空证明（简化版）
          let index = 0;
          for (const addr of addresses) {
            await run(env, `
              UPDATE airdrop_eligible
              SET item_index = ?,
                  proof = ?,
                  merkle_batch = ?
              WHERE wallet = ? AND event_id = ?
            `, [
              index,
              JSON.stringify([`0x${simpleRoot.substring(0, 64)}`]),
              eventId,
              addr.toLowerCase(),
              eventId
            ]);
            index++;
          }
          
          // 创建批次记录
          await run(env, `
            INSERT INTO merkle_batches (batch_id, merkle_root, distributor_address, total_amount, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'))
            ON CONFLICT(batch_id) DO UPDATE SET
              merkle_root = excluded.merkle_root,
              total_amount = excluded.total_amount
          `, [
            eventId,
            '0x' + simpleRoot,
            env.DISTRIBUTOR_ADDRESS || '0x0000000000000000000000000000000000000000',
            (BigInt(amount) * BigInt(addresses.length)).toString(),
            adminCheck.wallet
          ]);
          
          return withCors(jsonResponse({
            ok: true,
            eventId,
            merkleRoot: '0x' + simpleRoot,
            totalAddresses: addresses.length,
            totalAmount: (BigInt(amount) * BigInt(addresses.length)).toString()
          }), pickAllowedOrigin(req));
          
        } catch (error) {
          console.error('Generate merkle error:', error);
          return withCors(errorResponse(error.message, 500), pickAllowedOrigin(req));
        }
      }

      // 兜底
      return withCors(errorResponse("not found", 404), pickAllowedOrigin(req));

    } catch (e) {
      console.error('Worker error:', e);
      return json(env, { ok: false, error: 'INTERNAL_ERROR', message: e.message }, 500);
    }
  }
};