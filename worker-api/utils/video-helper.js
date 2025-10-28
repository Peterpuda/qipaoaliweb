/**
 * Video Generation Helper
 * 使用 Replicate API 生成文化叙事视频
 * 支持多个开源模型：Stable Video Diffusion, AnimateDiff 等
 */

/**
 * 从文化叙事文本构建视频提示词
 * @param {string} narrativeText - 叙事文本
 * @param {string} narrativeType - 叙事类型
 * @param {string} productName - 商品名称
 * @returns {string} 视频生成提示词
 */
export function buildVideoPrompt(narrativeText, narrativeType, productName) {
  // 从叙事文本中提取关键词
  const keywords = extractKeywords(narrativeText);
  
  const styleMap = {
    'story': 'cinematic storytelling, warm lighting, soft focus, cultural heritage atmosphere',
    'feature': 'product showcase, detailed close-up, elegant presentation, professional lighting',
    'heritage': 'traditional craftsmanship, artisan hands working, cultural symbols, ancient techniques',
    'usage': 'lifestyle scenes, modern elegant, practical demonstration, refined atmosphere'
  };

  const style = styleMap[narrativeType] || styleMap['feature'];
  
  return `
A high-quality video showcasing ${productName}.
Style: Chinese traditional culture, ${style}.
Scene: ${keywords.scene || 'elegant Chinese interior'}
Focus: ${keywords.craft || 'exquisite craftsmanship'}
Mood: ${keywords.mood || 'elegant, cultural, refined'}
Visual: 4K quality, slow motion, cinematic lighting, warm color palette
Camera: smooth pan, gentle zoom, artistic composition
No text, no watermark, professional production quality
  `.trim();
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
 * 生成视频（使用 Replicate API）
 * @param {string} prompt - 视频生成提示词
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} 视频生成任务 ID
 */
export async function generateVideo(prompt, options = {}) {
  const {
    model = 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    duration = 25,           // 视频帧数（约 4 秒）
    motion_bucket_id = 127,  // 运动强度 1-255
    apiKey = null
  } = options;

  if (!apiKey) {
    throw new Error('Replicate API key is required for video generation');
  }

  try {
    // 创建预测任务
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: model.split(':')[1],
        input: {
          prompt: prompt,
          frames_per_second: 6,
          num_frames: duration,
          motion_bucket_id: motion_bucket_id
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Video API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      urls: data.urls
    };
  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

/**
 * 检查视频生成状态
 * @param {string} predictionId - 预测任务 ID
 * @param {string} apiKey - Replicate API key
 * @returns {Promise<Object>} 任务状态
 */
export async function checkVideoStatus(predictionId, apiKey) {
  try {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Status check error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      status: data.status,        // starting/processing/succeeded/failed/canceled
      output: data.output,        // 视频 URL（完成后）
      error: data.error,          // 错误信息（如果失败）
      logs: data.logs,            // 生成日志
      metrics: data.metrics       // 生成指标
    };
  } catch (error) {
    console.error('Check video status failed:', error);
    throw error;
  }
}

/**
 * 下载视频并上传到 R2
 * @param {string} videoUrl - Replicate 生成的视频 URL
 * @param {Object} env - Worker 环境变量
 * @param {string} narrativeId - 叙事 ID
 * @returns {Promise<Object>} { key, url, size, duration }
 */
export async function downloadAndUploadVideo(videoUrl, env, narrativeId) {
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

    // 估算视频时长（基于文件大小的粗略估算）
    // 假设 1080p 30fps 视频约 8-10 MB/分钟
    const estimatedDuration = Math.ceil((videoData.byteLength / 1024 / 1024) / 0.15);

    return {
      key: key,
      url: publicUrl,
      size: videoData.byteLength,
      duration: estimatedDuration
    };
  } catch (error) {
    console.error('Download and upload video failed:', error);
    throw error;
  }
}

/**
 * 生成视频缩略图
 * @param {string} videoUrl - 视频 URL
 * @param {Object} env - Worker 环境变量
 * @param {string} narrativeId - 叙事 ID
 * @returns {Promise<string>} 缩略图 URL
 */
export async function generateThumbnail(videoUrl, env, narrativeId) {
  // 注意：视频缩略图生成需要额外的 API 或服务
  // 这里返回一个占位符，实际项目中可以：
  // 1. 使用 Cloudflare Images 的视频缩略图功能
  // 2. 使用第三方服务（如 Cloudinary）
  // 3. 自己实现视频帧提取
  
  // 暂时返回视频本身作为缩略图
  return videoUrl;
}

/**
 * 获取推荐的视频风格
 * @param {string} narrativeType - 叙事类型
 * @returns {Object} 视频配置
 */
export function getRecommendedVideoStyle(narrativeType) {
  const styleMap = {
    'story': {
      motion_bucket_id: 100,    // 中等运动
      duration: 25,             // 约 4 秒
      description: '叙事电影感'
    },
    'feature': {
      motion_bucket_id: 80,     // 轻微运动
      duration: 20,             // 约 3 秒
      description: '产品展示风'
    },
    'heritage': {
      motion_bucket_id: 60,     // 缓慢运动
      duration: 30,             // 约 5 秒
      description: '文化传承风'
    },
    'usage': {
      motion_bucket_id: 120,    // 较快运动
      duration: 20,             // 约 3 秒
      description: '实用场景风'
    }
  };

  return styleMap[narrativeType] || styleMap['feature'];
}

