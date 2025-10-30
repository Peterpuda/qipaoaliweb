/**
 * Video Generation Helper
 * 使用 HeyGen API 生成文化叙事视频
 * 使用数字人朗读文化故事，展现传统工艺之美
 */

/**
 * 从文化叙事文本构建视频脚本
 * @param {string} narrativeText - 叙事文本
 * @param {string} narrativeType - 叙事类型
 * @param {string} productName - 商品名称
 * @returns {string} 视频脚本文本
 */
export function buildVideoPrompt(narrativeText, narrativeType, productName) {
  // HeyGen 使用文本直接作为数字人的朗读内容
  // 可以在文本前后添加简短的介绍语
  
  const introMap = {
    'story': `欢迎了解${productName}背后的故事。`,
    'feature': `让我为您介绍${productName}的独特之处。`,
    'heritage': `${productName}承载着深厚的文化传承。`,
    'usage': `关于${productName}的使用，这里有一些建议。`
  };

  const intro = introMap[narrativeType] || '';
  
  // 组合介绍语和叙事内容
  return intro ? `${intro}\n\n${narrativeText}` : narrativeText;
}

/**
 * 从文本中提取关键词
 * @param {string} text - 文本内容
 * @returns {Object} 关键词对象
 */
function extractKeywords(text) {
  const keywords = {
    scene: null,
    craft: null,
    mood: null
  };

  // 场景关键词
  const sceneKeywords = ['工作室', '作坊', '传统', '古典', '现代', '庭院', '室内'];
  for (const keyword of sceneKeywords) {
    if (text.includes(keyword)) {
      keywords.scene = keyword;
      break;
    }
  }

  // 工艺关键词
  const craftKeywords = ['刺绣', '编织', '雕刻', '绘制', '制作', '工艺', '手工'];
  for (const keyword of craftKeywords) {
    if (text.includes(keyword)) {
      keywords.craft = keyword;
      break;
    }
  }

  // 情绪关键词
  const moodKeywords = ['优雅', '精致', '传统', '文化', '艺术', '匠心'];
  for (const keyword of moodKeywords) {
    if (text.includes(keyword)) {
      keywords.mood = keyword;
      break;
    }
  }

  return keywords;
}

/**
 * 生成视频（使用 HeyGen API）
 * @param {string} prompt - 视频脚本文本（数字人朗读内容）
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} 视频生成任务信息
 */
export async function generateVideo(prompt, options = {}) {
  const {
    avatar_id = 'Anna_public_3_20240108',  // 默认虚拟人（优雅的亚洲女性形象）
    voice_id = 'b8c6c5458294488d96ca8f5a77d7c700',  // 默认中文女声
    background_type = 'color',
    background_value = '#F5F5DC',  // 米白色背景，符合文化产品调性
    test_mode = false,  // 测试模式（用于开发）
    apiKey = null
  } = options;

  if (!apiKey) {
    throw new Error('HeyGen API key is required for video generation');
  }

  try {
    // 创建视频生成任务
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        test: test_mode,
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: avatar_id,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: prompt,
              voice_id: voice_id,
              speed: 1.0
            },
            background: {
              type: background_type,
              value: background_value
            }
          }
        ],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: '16:9'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.video_id) {
      throw new Error('Invalid response from HeyGen API');
    }

    return {
      id: data.data.video_id,
      status: 'processing',
      urls: null
    };
  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

/**
 * 检查视频生成状态（使用 HeyGen API）
 * @param {string} videoId - HeyGen 视频任务 ID
 * @param {string} apiKey - HeyGen API key
 * @returns {Promise<Object>} 任务状态
 */
export async function checkVideoStatus(videoId, apiKey) {
  try {
    const response = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      {
        headers: {
          'X-Api-Key': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Status check error: ${response.status}`);
    }

    const data = await response.json();
    
    // HeyGen 状态映射
    // pending -> processing
    // processing -> processing
    // completed -> succeeded
    // failed -> failed
    
    const statusMap = {
      'pending': 'processing',
      'processing': 'processing',
      'completed': 'succeeded',
      'failed': 'failed'
    };
    
    const heygenStatus = data.data?.status || 'unknown';
    const mappedStatus = statusMap[heygenStatus] || heygenStatus;
    
    return {
      status: mappedStatus,
      output: data.data?.video_url || null,  // 视频 URL（完成后）
      error: data.data?.error || null,       // 错误信息（如果失败）
      thumbnail_url: data.data?.thumbnail_url || null,  // 缩略图
      duration: data.data?.duration || null,  // 视频时长
      callback_id: data.data?.callback_id || null
    };
  } catch (error) {
    console.error('Check video status failed:', error);
    throw error;
  }
}

/**
 * 下载视频并上传到 R2
 * @param {string} videoUrl - HeyGen 生成的视频 URL
 * @param {Object} env - Worker 环境变量
 * @param {string} narrativeId - 叙事 ID
 * @param {number} duration - 视频时长（秒）
 * @returns {Promise<Object>} { key, url, size, duration }
 */
export async function downloadAndUploadVideo(videoUrl, env, narrativeId, duration = null) {
  const key = `narratives/video/${narrativeId}.mp4`;
  
  try {
    // 下载视频
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Download video failed: ${response.status}`);
    }

    const videoData = await response.arrayBuffer();
    
    // 上传到 R2
    await env.R2_BUCKET.put(key, videoData, {
      httpMetadata: {
        contentType: 'video/mp4'
      }
    });

    // 生成公开访问 URL
    const publicUrl = env.R2_PUBLIC_URL 
      ? `${env.R2_PUBLIC_URL}/${key}`
      : `/r2/${key}`;

    // 使用 HeyGen 返回的时长，如果没有则估算
    let videoDuration = duration;
    if (!videoDuration) {
      // 假设 720p 25fps 视频约 5-8 MB/分钟
      videoDuration = Math.ceil((videoData.byteLength / 1024 / 1024) / 0.1);
    }

    return {
      key: key,
      url: publicUrl,
      size: videoData.byteLength,
      duration: videoDuration
    };
  } catch (error) {
    console.error('Download and upload video failed:', error);
    throw error;
  }
}

/**
 * 生成视频缩略图
 * @param {string} thumbnailUrl - HeyGen 提供的缩略图 URL
 * @param {Object} env - Worker 环境变量
 * @param {string} narrativeId - 叙事 ID
 * @returns {Promise<string>} 缩略图 URL
 */
export async function generateThumbnail(thumbnailUrl, env, narrativeId) {
  // HeyGen 直接提供缩略图 URL
  // 如果需要存储到 R2，可以下载并上传
  if (!thumbnailUrl) {
    return null;
  }
  
  try {
    const key = `narratives/thumbnails/${narrativeId}.jpg`;
    
    // 下载缩略图
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      console.warn('Failed to download thumbnail, using original URL');
      return thumbnailUrl;
    }
    
    const thumbnailData = await response.arrayBuffer();
    
    // 上传到 R2
    await env.R2_BUCKET.put(key, thumbnailData, {
      httpMetadata: {
        contentType: 'image/jpeg'
      }
    });
    
    // 生成公开访问 URL
    const publicUrl = env.R2_PUBLIC_URL 
      ? `${env.R2_PUBLIC_URL}/${key}`
      : `/r2/${key}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Failed to process thumbnail:', error);
    return thumbnailUrl;  // 失败时返回原始 URL
  }
}

/**
 * 获取推荐的视频风格（HeyGen 虚拟人和背景配置）
 * @param {string} narrativeType - 叙事类型
 * @returns {Object} 视频配置
 */
export function getRecommendedVideoStyle(narrativeType) {
  const styleMap = {
    'story': {
      avatar_id: 'Anna_public_3_20240108',  // 优雅的亚洲女性，适合讲故事
      voice_id: 'b8c6c5458294488d96ca8f5a77d7c700',  // 温柔中文女声
      background_value: '#F5F5DC',  // 米白色，温馨氛围
      description: '叙事电影感 - 温柔讲述文化故事'
    },
    'feature': {
      avatar_id: 'Anna_public_3_20240108',  // 专业形象，适合产品介绍
      voice_id: 'b8c6c5458294488d96ca8f5a77d7c700',  // 清晰中文女声
      background_value: '#FFFFFF',  // 纯白色，突出专业
      description: '产品展示风 - 专业介绍工艺特色'
    },
    'heritage': {
      avatar_id: 'Anna_public_3_20240108',  // 庄重形象，适合文化传承
      voice_id: 'b8c6c5458294488d96ca8f5a77d7c700',  // 沉稳中文声音
      background_value: '#FAF0E6',  // 亚麻色，传统氛围
      description: '文化传承风 - 讲述历史与传承'
    },
    'usage': {
      avatar_id: 'Anna_public_3_20240108',  // 亲和形象，适合使用指导
      voice_id: 'b8c6c5458294488d96ca8f5a77d7c700',  // 友好中文声音
      background_value: '#F0F8FF',  // 浅蓝色，清新实用
      description: '实用场景风 - 讲解使用与保养'
    }
  };

  return styleMap[narrativeType] || styleMap['feature'];
}

/**
 * 获取可用的 HeyGen 虚拟人列表
 * @returns {Array} 虚拟人配置数组
 */
export function getAvailableAvatars() {
  return [
    {
      id: 'Anna_public_3_20240108',
      name: 'Anna',
      description: '优雅的亚洲女性，适合文化产品讲解',
      language: 'zh',
      style: 'professional'
    },
    {
      id: 'josh_lite3_20230714',
      name: 'Josh',
      description: '专业男性形象，适合正式场合',
      language: 'zh',
      style: 'formal'
    },
    {
      id: 'Tyler-incasual-20220721',
      name: 'Tyler',
      description: '年轻活力形象，适合现代产品',
      language: 'zh',
      style: 'casual'
    }
  ];
}

/**
 * 获取可用的 HeyGen 中文语音列表
 * @returns {Array} 语音配置数组
 */
export function getAvailableVoices() {
  return [
    {
      id: 'b8c6c5458294488d96ca8f5a77d7c700',
      name: '中文女声（温柔）',
      description: '适合故事叙述和文化传承',
      gender: 'female',
      style: 'warm'
    },
    {
      id: '2d5b0e6cf36f460aa7fc47e3eee4ba54',
      name: '中文女声（专业）',
      description: '适合产品介绍和使用指导',
      gender: 'female',
      style: 'professional'
    },
    {
      id: 'af9d4b0e8d0f4e0e9f7c8a3b2c1d0e1f',
      name: '中文男声（沉稳）',
      description: '适合正式场合和历史讲解',
      gender: 'male',
      style: 'steady'
    }
  ];
}

