/**
 * TTS (Text-to-Speech) Helper
 * 使用 OpenAI TTS API 生成高质量语音
 */

/**
 * 生成语音文件
 * @param {string} text - 要转换的文本
 * @param {Object} options - 配置选项
 * @returns {Promise<ArrayBuffer>} 音频数据
 */
export async function generateAudio(text, options = {}) {
  const {
    voice = 'alloy',          // alloy/echo/fable/onyx/nova/shimmer
    model = 'tts-1',          // tts-1 或 tts-1-hd (高清版)
    speed = 1.0,              // 0.25 到 4.0
    apiKey = null
  } = options;

  if (!apiKey) {
    throw new Error('OpenAI API key is required for TTS');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        input: text,
        voice: voice,
        speed: speed,
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TTS API error: ${response.status} ${error}`);
    }

    const audioData = await response.arrayBuffer();
    return audioData;
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw error;
  }
}

/**
 * 获取音频时长估算（秒）
 * 基于中文平均阅读速度：每分钟约 250-300 字
 * @param {string} text - 文本内容
 * @param {number} speed - 语速倍数
 * @returns {number} 预估时长（秒）
 */
export function estimateAudioDuration(text, speed = 1.0) {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  
  // 中文：每分钟 250 字
  // 英文：每分钟 150 词
  const chineseDuration = (chineseChars / 250) * 60;
  const englishDuration = (englishWords / 150) * 60;
  
  const totalDuration = (chineseDuration + englishDuration) / speed;
  
  return Math.ceil(totalDuration);
}

/**
 * 获取推荐的声音配置
 * @param {string} narrativeType - 叙事类型
 * @returns {Object} 声音配置
 */
export function getRecommendedVoice(narrativeType) {
  const voiceMap = {
    'story': {
      voice: 'nova',        // 温柔、有故事感
      speed: 0.9,          // 稍慢，便于理解
      description: '温柔叙事女声'
    },
    'feature': {
      voice: 'alloy',       // 中性、专业
      speed: 1.0,
      description: '专业介绍声'
    },
    'heritage': {
      voice: 'onyx',        // 深沉、有文化感
      speed: 0.85,         // 缓慢、庄重
      description: '沉稳文化男声'
    },
    'usage': {
      voice: 'shimmer',     // 清晰、友好
      speed: 1.1,          // 稍快，实用性强
      description: '清晰指导女声'
    }
  };

  return voiceMap[narrativeType] || voiceMap['feature'];
}

/**
 * 上传音频到 R2
 * @param {ArrayBuffer} audioData - 音频数据
 * @param {Object} env - Worker 环境变量
 * @param {string} narrativeId - 叙事 ID
 * @returns {Promise<Object>} { key, url, size }
 */
export async function uploadAudioToR2(audioData, env, narrativeId) {
  const key = `narratives/audio/${narrativeId}.mp3`;
  
  try {
    await env.R2_BUCKET.put(key, audioData, {
      httpMetadata: {
        contentType: 'audio/mpeg'
      }
    });

    // 生成公开访问 URL（如果配置了 R2 公开域名）
    const publicUrl = env.R2_PUBLIC_URL 
      ? `${env.R2_PUBLIC_URL}/${key}`
      : `/r2/${key}`;

    return {
      key: key,
      url: publicUrl,
      size: audioData.byteLength
    };
  } catch (error) {
    console.error('Upload audio to R2 failed:', error);
    throw error;
  }
}

