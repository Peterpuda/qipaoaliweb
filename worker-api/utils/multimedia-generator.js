/**
 * 多媒体文化叙事生成器
 * 集成文字、语音、视频生成
 */

import { generateAudio, estimateAudioDuration, uploadAudioToR2, getRecommendedVoice } from './tts-helper.js';
import { 
  buildVideoPrompt, 
  generateVideo, 
  checkVideoStatus, 
  downloadAndUploadVideo,
  getRecommendedVideoStyle 
} from './video-helper.js';

/**
 * 生成完整的多媒体叙事内容
 * @param {Object} params - 参数
 * @returns {Promise<Object>} 生成结果
 */
export async function generateMultimediaNarrative(params) {
  const {
    narrativeText,
    narrativeType,
    narrativeId,
    productName,
    options = {},
    env
  } = params;

  const {
    generateAudioFlag = false,
    generateVideoFlag = false,
    voiceStyle = null,
    videoStyle = null
  } = options;

  const result = {
    text: {
      status: 'completed',
      content: narrativeText
    },
    audio: null,
    video: null
  };

  // 生成音频
  if (generateAudioFlag && env.OPENAI_API_KEY) {
    try {
      console.log(`Generating audio for narrative ${narrativeId}...`);
      
      const voiceConfig = voiceStyle 
        ? { voice: voiceStyle, speed: 1.0 }
        : getRecommendedVoice(narrativeType);
      
      const audioData = await generateAudio(narrativeText, {
        voice: voiceConfig.voice,
        speed: voiceConfig.speed,
        model: 'tts-1',  // 使用标准模型，成本更低
        apiKey: env.OPENAI_API_KEY
      });

      const duration = estimateAudioDuration(narrativeText, voiceConfig.speed);
      
      const uploadResult = await uploadAudioToR2(audioData, env, narrativeId);
      
      result.audio = {
        status: 'completed',
        key: uploadResult.key,
        url: uploadResult.url,
        size: uploadResult.size,
        duration: duration,
        voice: voiceConfig.voice
      };
      
      console.log(`Audio generated successfully: ${uploadResult.key}`);
    } catch (error) {
      console.error(`Audio generation failed for ${narrativeId}:`, error);
      result.audio = {
        status: 'failed',
        error: error.message
      };
    }
  }

  // 生成视频（使用 HeyGen API）
  if (generateVideoFlag && env.HEYGEN_API_KEY) {
    try {
      console.log(`Generating video with HeyGen for narrative ${narrativeId}...`);
      
      // 获取推荐的视频风格配置
      const videoStyleConfig = getRecommendedVideoStyle(narrativeType);
      
      // 如果用户指定了视频风格，解析为 avatar_id
      // videoStyle 格式: "avatar_id" 字符串（如 "Anna_public_3_20240108"）
      let finalConfig = { ...videoStyleConfig };
      if (videoStyle && typeof videoStyle === 'string') {
        // 检查是否是有效的 avatar ID（不是纯数字）
        // 旧的 Replicate motion_bucket_id 是纯数字（如 "60", "80"），需要忽略
        if (isNaN(videoStyle) && videoStyle.length > 10) {
          // 是有效的 avatar ID
          finalConfig.avatar_id = videoStyle;
        }
        // 否则使用默认配置
      }
      
      const prompt = buildVideoPrompt(narrativeText, narrativeType, productName);
      
      const videoTask = await generateVideo(prompt, {
        avatar_id: finalConfig.avatar_id,
        voice_id: finalConfig.voice_id,
        background_value: finalConfig.background_value,
        test_mode: false,  // 生产模式
        apiKey: env.HEYGEN_API_KEY
      });
      
      // 视频生成是异步的，返回任务 ID
      result.video = {
        status: 'processing',
        task_id: videoTask.id,
        message: '视频正在生成中（HeyGen），预计需要 3-10 分钟，请稍后刷新查看'
      };
      
      console.log(`HeyGen video generation started: ${videoTask.id}`);
    } catch (error) {
      console.error(`HeyGen video generation failed for ${narrativeId}:`, error);
      result.video = {
        status: 'failed',
        error: error.message
      };
    }
  }

  return result;
}

/**
 * 检查并完成视频生成（HeyGen）
 * @param {string} narrativeId - 叙事 ID
 * @param {string} taskId - 视频生成任务 ID
 * @param {Object} env - 环境变量
 * @returns {Promise<Object>} 视频信息或状态
 */
export async function checkAndCompleteVideo(narrativeId, taskId, env) {
  if (!env.HEYGEN_API_KEY) {
    throw new Error('HeyGen API key not configured');
  }

  const status = await checkVideoStatus(taskId, env.HEYGEN_API_KEY);
  
  if (status.status === 'succeeded' && status.output) {
    // 视频生成完成，下载并上传到 R2
    const uploadResult = await downloadAndUploadVideo(
      status.output,
      env,
      narrativeId,
      status.duration  // HeyGen 提供的视频时长
    );
    
    return {
      status: 'completed',
      key: uploadResult.key,
      url: uploadResult.url,
      size: uploadResult.size,
      duration: uploadResult.duration,
      thumbnail: status.thumbnail_url  // HeyGen 提供的缩略图
    };
  } else if (status.status === 'failed') {
    return {
      status: 'failed',
      error: status.error || 'HeyGen video generation failed'
    };
  } else {
    return {
      status: status.status,
      message: '视频正在生成中（HeyGen）...'
    };
  }
}

/**
 * 获取多媒体生成的成本估算
 * @param {Object} options - 选项
 * @returns {Object} 成本估算
 */
export function estimateMultimediaCost(options) {
  const {
    textLength = 0,
    generateAudio = false,
    generateVideo = false,
    narrativeTypes = []
  } = options;

  let cost = {
    text: 0,
    audio: 0,
    video: 0,
    total: 0,
    currency: 'CNY'
  };

  // 文字生成成本（OpenAI GPT-4）
  // 假设输入 1000 tokens，输出 500 tokens
  // GPT-4: $0.03/1K input + $0.06/1K output
  const textCostPerNarrative = (0.03 * 1 + 0.06 * 0.5) * 7.2; // 转换为人民币
  cost.text = textCostPerNarrative * narrativeTypes.length;

  // 音频生成成本（OpenAI TTS）
  // $15/1M characters ≈ ¥0.0001/字
  if (generateAudio) {
    const avgCharsPerNarrative = 500;
    cost.audio = (avgCharsPerNarrative * 0.0001) * narrativeTypes.length;
  }

  // 视频生成成本（HeyGen API）
  // Creator 套餐: $1 ≈ 1分钟视频
  // 假设每个叙事视频约 30-60 秒，成本约 $0.5-1 ≈ ¥3.6-7.2
  // 保守估计: ¥5/个视频
  if (generateVideo) {
    cost.video = 5.0 * narrativeTypes.length;
  }

  cost.total = cost.text + cost.audio + cost.video;

  return cost;
}

