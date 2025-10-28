// AI 智能体辅助函数
// 提供 AI 模型调用、Prompt 构建、内容审核等功能

/**
 * 生成匠人 AI 的系统提示词
 * @param {Object} artisanData - 匠人信息
 * @param {Object} voiceConfig - AI 人格配置
 * @param {string} lang - 语言
 * @returns {string} 系统提示词
 */
export function buildArtisanSystemPrompt(artisanData, voiceConfig, lang = 'zh') {
  const langMap = {
    zh: {
      intro: '你是',
      heritage: '，专注于传统非遗技艺的传承与创新。',
      personality: '你的性格特点：',
      values: '核心价值观：',
      lineage: '文化传承背景：',
      rules: '对话规则：',
      tone: {
        warm: '温暖亲切',
        professional: '专业严谨',
        passionate: '热情洋溢',
        humble: '谦逊低调'
      }
    },
    en: {
      intro: 'You are',
      heritage: ', dedicated to preserving and innovating traditional heritage crafts.',
      personality: 'Your personality:',
      values: 'Core values:',
      lineage: 'Cultural lineage:',
      rules: 'Conversation rules:',
      tone: {
        warm: 'warm and approachable',
        professional: 'professional and rigorous',
        passionate: 'enthusiastic and passionate',
        humble: 'humble and modest'
      }
    }
  };

  const l = langMap[lang] || langMap.zh;
  const artisanName = lang === 'zh' ? artisanData.name_zh : artisanData.name_en;
  const toneDesc = l.tone[voiceConfig.tone_style] || l.tone.warm;

  let prompt = `${l.intro} ${artisanName}${l.heritage}\n\n`;

  // 性格特点
  prompt += `${l.personality} ${toneDesc}\n\n`;

  // 核心价值观
  if (voiceConfig.core_values) {
    prompt += `${l.values}\n${voiceConfig.core_values}\n\n`;
  }

  // 文化传承背景
  if (voiceConfig.cultural_lineage) {
    prompt += `${l.lineage}\n${voiceConfig.cultural_lineage}\n\n`;
  }

  // 自我介绍
  const selfIntro = lang === 'zh' ? voiceConfig.self_intro_zh : voiceConfig.self_intro_en;
  if (selfIntro) {
    prompt += `${selfIntro}\n\n`;
  }

  // 对话规则
  prompt += `${l.rules}\n`;
  prompt += lang === 'zh' 
    ? `1. 以第一人称回答，语气自然、真诚\n2. 回答时结合你的实际经验和技艺\n3. 适度引用传统文化知识\n4. 保持回答简洁（200字以内为宜）\n5. 如果不确定，请诚实表示\n`
    : `1. Answer in first person, naturally and sincerely\n2. Draw from your actual experience and craftsmanship\n3. Reference traditional cultural knowledge appropriately\n4. Keep answers concise (within 200 words)\n5. Be honest if you're uncertain\n`;

  // 禁止话题
  if (voiceConfig.forbidden_topics) {
    try {
      const forbidden = JSON.parse(voiceConfig.forbidden_topics);
      if (forbidden.length > 0) {
        prompt += lang === 'zh'
          ? `\n禁止讨论的话题：${forbidden.join('、')}\n`
          : `\nForbidden topics: ${forbidden.join(', ')}\n`;
      }
    } catch (e) {
      console.error('解析禁止话题失败:', e);
    }
  }

  return prompt;
}

/**
 * 构建对话消息数组（包含 few-shot 示例）
 * @param {string} systemPrompt - 系统提示词
 * @param {Object} voiceConfig - AI 人格配置
 * @param {string} question - 用户问题
 * @returns {Array} 消息数组
 */
export function buildChatMessages(systemPrompt, voiceConfig, question) {
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  // 添加 few-shot 示例
  if (voiceConfig.examples) {
    try {
      const examples = JSON.parse(voiceConfig.examples);
      examples.forEach(ex => {
        messages.push({ role: 'user', content: ex.q });
        messages.push({ role: 'assistant', content: ex.a });
      });
    } catch (e) {
      console.error('解析对话示例失败:', e);
    }
  }

  // 添加当前问题
  messages.push({ role: 'user', content: question });

  return messages;
}

/**
 * 调用 OpenAI API
 * @param {string} apiKey - OpenAI API Key
 * @param {Array} messages - 消息数组
 * @param {Object} config - 模型配置
 * @returns {Promise<Object>} 响应结果
 */
export async function callOpenAI(apiKey, messages, config = {}) {
  const defaultConfig = {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 500
  };

  const finalConfig = { ...defaultConfig, ...config };

  const startTime = Date.now();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: finalConfig.model,
        messages: messages,
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.max_tokens
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API 错误:', error);
      return {
        ok: false,
        error: error.error?.message || 'OpenAI API 调用失败',
        responseTime
      };
    }

    const data = await response.json();
    
    return {
      ok: true,
      answer: data.choices[0].message.content,
      model: data.model,
      tokensUsed: data.usage?.total_tokens || 0,
      responseTime
    };

  } catch (error) {
    console.error('OpenAI API 请求失败:', error);
    return {
      ok: false,
      error: error.message || '网络请求失败',
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * 调用 Claude API (Anthropic)
 * @param {string} apiKey - Anthropic API Key
 * @param {Array} messages - 消息数组
 * @param {Object} config - 模型配置
 * @returns {Promise<Object>} 响应结果
 */
export async function callClaude(apiKey, messages, config = {}) {
  const defaultConfig = {
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    max_tokens: 500
  };

  const finalConfig = { ...defaultConfig, ...config };
  const startTime = Date.now();

  try {
    // 提取系统消息
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: finalConfig.model,
        system: systemMsg?.content || '',
        messages: chatMessages,
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.max_tokens
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API 错误:', error);
      return {
        ok: false,
        error: error.error?.message || 'Claude API 调用失败',
        responseTime
      };
    }

    const data = await response.json();
    
    return {
      ok: true,
      answer: data.content[0].text,
      model: data.model,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
      responseTime
    };

  } catch (error) {
    console.error('Claude API 请求失败:', error);
    return {
      ok: false,
      error: error.message || '网络请求失败',
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * 生成模拟 AI 回复（用于开发测试）
 * @param {string} question - 用户问题
 * @param {string} artisanName - 匠人名字
 * @param {string} lang - 语言
 * @returns {Promise<Object>} 模拟响应
 */
export async function generateMockReply(question, artisanName, lang = 'zh') {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  const templates = {
    zh: [
      `感谢你的提问！关于${extractKeyword(question)}，这是我多年实践中积累的经验...`,
      `这个问题很好。${extractKeyword(question)}确实是传统技艺中很重要的一环。让我详细说说...`,
      `说到${extractKeyword(question)}，这让我想起了师傅当年的教导。在我们这一行...`,
      `关于${extractKeyword(question)}，每个匠人可能有不同的理解。在我看来...`
    ],
    en: [
      `Thank you for your question! Regarding ${extractKeyword(question)}, this is based on years of practice...`,
      `That's a great question. ${extractKeyword(question)} is indeed an important aspect of traditional craftsmanship...`,
      `Speaking of ${extractKeyword(question)}, this reminds me of my master's teachings...`,
      `About ${extractKeyword(question)}, different artisans may have different perspectives...`
    ]
  };

  const template = templates[lang] || templates.zh;
  const randomTemplate = template[Math.floor(Math.random() * template.length)];

  return {
    ok: true,
    answer: randomTemplate,
    model: 'mock-v1',
    tokensUsed: 150,
    responseTime: 1000
  };
}

/**
 * 提取问题关键词（简单实现）
 */
function extractKeyword(question) {
  const keywords = ['工艺', '技艺', '制作', '材料', '保养', '文化', '传承', '创作'];
  for (const kw of keywords) {
    if (question.includes(kw)) return kw;
  }
  return '这个问题';
}

/**
 * 内容审核（简单关键词过滤）
 * @param {string} text - 待审核文本
 * @returns {Object} 审核结果 {ok, flagged, reason}
 */
export function moderateContent(text) {
  const sensitiveKeywords = [
    '政治', '暴力', '色情', '赌博', '毒品',
    'politics', 'violence', 'porn', 'gambling', 'drugs'
  ];

  for (const keyword of sensitiveKeywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      return {
        ok: false,
        flagged: true,
        reason: `包含敏感词: ${keyword}`,
        flagType: 'sensitive'
      };
    }
  }

  // 检查长度
  if (text.length > 2000) {
    return {
      ok: false,
      flagged: true,
      reason: '文本过长',
      flagType: 'spam'
    };
  }

  return {
    ok: true,
    flagged: false
  };
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

