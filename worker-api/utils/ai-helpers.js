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

/**
 * 生成商品文化叙事的系统提示词
 * ✅ 只使用商品数据，不涉及匠人信息
 * @param {Object} productData - 商品信息
 * @param {string} narrativeType - 叙事类型 (story/feature/heritage/usage)
 * @param {string} lang - 语言
 * @returns {string} 系统提示词
 */
export function buildNarrativeSystemPrompt(productData, narrativeType, lang = 'zh') {
  const typeDescriptions = {
    zh: {
      story: {
        name: '故事版',
        desc: '讲述这件作品背后的文化故事和历史渊源',
        guidelines: [
          '客观专业的叙述方式',
          '聚焦商品的文化内涵和历史背景',
          '描述相关的传统技艺和工艺特点',
          '体现文化传承的价值和意义',
          '字数控制在 200-300 字'
        ]
      },
      feature: {
        name: '特点版',
        desc: '详细介绍这件作品的特色和工艺亮点',
        guidelines: [
          '客观专业的介绍方式',
          '突出独特的工艺技法',
          '说明材料的选择和特性',
          '强调细节和品质',
          '字数控制在 150-200 字'
        ]
      },
      heritage: {
        name: '传承版',
        desc: '阐述这件作品承载的文化传承和历史价值',
        guidelines: [
          '介绍相关的非遗技艺背景',
          '说明技艺的历史渊源',
          '体现文化传承的意义',
          '连接传统与现代',
          '字数控制在 200-250 字'
        ]
      },
      usage: {
        name: '使用版',
        desc: '说明这件作品的使用场景和保养方法',
        guidelines: [
          '实用性强的建议',
          '适用场景描述',
          '保养和维护方法',
          '注意事项提醒',
          '字数控制在 150-200 字'
        ]
      }
    },
    en: {
      story: {
        name: 'Story Version',
        desc: 'Tell the cultural story and historical origins behind this piece',
        guidelines: [
          'Use objective and professional tone',
          'Focus on cultural connotations and historical background',
          'Describe related traditional craftsmanship and techniques',
          'Reflect the value and significance of cultural heritage',
          'Keep within 200-300 words'
        ]
      },
      feature: {
        name: 'Feature Version',
        desc: 'Detail the features and craftsmanship highlights',
        guidelines: [
          'Objective and professional tone',
          'Highlight unique techniques',
          'Explain material selection and properties',
          'Emphasize details and quality',
          'Keep within 150-200 words'
        ]
      },
      heritage: {
        name: 'Heritage Version',
        desc: 'Explain the cultural heritage and historical value',
        guidelines: [
          'Introduce intangible cultural heritage background',
          'Explain historical origins of the craft',
          'Reflect significance of cultural transmission',
          'Connect tradition with modernity',
          'Keep within 200-250 words'
        ]
      },
      usage: {
        name: 'Usage Version',
        desc: 'Explain usage scenarios and care instructions',
        guidelines: [
          'Practical suggestions',
          'Describe suitable occasions',
          'Care and maintenance methods',
          'Important notes and reminders',
          'Keep within 150-200 words'
        ]
      }
    }
  };

  const l = lang === 'zh' ? typeDescriptions.zh : typeDescriptions.en;
  const type = l[narrativeType] || l.story;
  
  const productName = lang === 'zh' ? productData.name_zh : productData.name_en;

  // ✅ 新的 Prompt：客观叙述，只关注商品的文化价值
  let prompt = lang === 'zh'
    ? `请为《${productName}》这件传统手工艺品撰写${type.name}文案。\n\n`
    : `Write a ${type.name} narrative for the traditional craft "${productName}".\n\n`;

  prompt += lang === 'zh' ? `任务说明：\n${type.desc}\n\n` : `Task Description:\n${type.desc}\n\n`;
  
  prompt += lang === 'zh' ? `写作指南：\n` : `Writing Guidelines:\n`;
  type.guidelines.forEach((guideline, index) => {
    prompt += `${index + 1}. ${guideline}\n`;
  });

  // 添加商品基本信息
  prompt += lang === 'zh' ? `\n商品信息参考：\n` : `\nProduct Information Reference:\n`;
  
  if (productData.desc_md) {
    prompt += lang === 'zh' 
      ? `- 商品描述：${productData.desc_md}\n`
      : `- Description: ${productData.desc_md}\n`;
  }
  
  if (productData.category) {
    prompt += lang === 'zh'
      ? `- 类别：${productData.category}\n`
      : `- Category: ${productData.category}\n`;
  }

  prompt += lang === 'zh'
    ? `\n请直接输出文案内容，不要包含标题或其他额外说明。以客观、专业的方式讲述这件作品的文化价值和历史意义。`
    : `\nPlease output the narrative content directly without title or additional explanation. Use an objective and professional tone to describe the cultural value and historical significance of this piece.`;

  return prompt;
}

/**
 * 生成文化叙事内容
 * ✅ 只使用商品数据
 * @param {string} apiKey - API Key
 * @param {Object} productData - 商品信息
 * @param {string} narrativeType - 叙事类型
 * @param {string} lang - 语言
 * @param {string} provider - AI 提供商 (openai/claude)
 * @returns {Promise<Object>} 响应结果
 */
export async function generateNarrative(apiKey, productData, narrativeType, lang = 'zh', provider = 'openai') {
  const systemPrompt = buildNarrativeSystemPrompt(productData, narrativeType, lang);
  const messages = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: lang === 'zh' 
        ? `请为这件作品生成${narrativeType === 'story' ? '故事' : narrativeType === 'feature' ? '特点' : narrativeType === 'heritage' ? '传承' : '使用'}文案。`
        : `Please generate a ${narrativeType} narrative for this piece.`
    }
  ];

  const config = {
    model: provider === 'claude' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
    temperature: 0.8, // 更高的创意性
    max_tokens: 600
  };

  if (provider === 'claude') {
    return await callClaude(apiKey, messages, config);
  } else {
    return await callOpenAI(apiKey, messages, config);
  }
}

/**
 * 批量生成多种叙事版本
 * ✅ 只使用商品数据
 * @param {string} apiKey - API Key
 * @param {Object} productData - 商品信息
 * @param {Array} types - 叙事类型数组
 * @param {string} lang - 语言
 * @param {string} provider - AI 提供商
 * @returns {Promise<Object>} 所有叙事结果
 */
export async function generateMultipleNarratives(apiKey, productData, types, lang = 'zh', provider = 'openai') {
  const results = {};
  
  for (const type of types) {
    try {
      const result = await generateNarrative(apiKey, productData, type, lang, provider);
      if (result.ok) {
        results[type] = {
          ok: true,
          content: result.answer,
          model: result.model,
          tokensUsed: result.tokensUsed
        };
      } else {
        results[type] = {
          ok: false,
          error: result.error
        };
      }
    } catch (error) {
      results[type] = {
        ok: false,
        error: error.message
      };
    }
  }
  
  return results;
}

