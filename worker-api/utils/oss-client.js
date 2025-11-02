// worker-api/utils/oss-client.js
// 阿里云OSS客户端 - 用于替代Cloudflare R2

import OSS from 'ali-oss';

let ossClient;
let config;

/**
 * 初始化OSS客户端
 * @param {Object} env - 环境变量对象
 * @returns {OSS} OSS客户端实例
 */
export function initOSS(env) {
  if (ossClient) {
    console.log('♻️ 复用现有OSS客户端');
    return ossClient;
  }
  
  config = {
    region: env.OSS_REGION || 'oss-cn-shanghai',
    accessKeyId: env.OSS_ACCESS_KEY_ID,
    accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
    bucket: env.OSS_BUCKET || 'songbrocade-media',
    // 是否使用内网（如果在ECS上运行可以启用以节省流量费用）
    internal: env.OSS_INTERNAL === 'true',
    // 超时设置
    timeout: 60000,
    // 是否使用HTTPS
    secure: true
  };
  
  ossClient = new OSS(config);
  
  console.log(`✅ OSS客户端已创建: ${config.bucket} (${config.region})`);
  
  return ossClient;
}

/**
 * 上传对象到OSS
 * @param {string} key - 对象键（路径）
 * @param {Buffer|Stream|string} content - 内容
 * @param {Object} options - 上传选项
 * @returns {Promise<Object>} 上传结果
 */
export async function putObject(key, content, options = {}) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const result = await ossClient.put(key, content, {
      // 默认选项
      timeout: 60000,
      ...options
    });
    
    console.log(`✅ 文件上传成功: ${key}`);
    return result;
  } catch (error) {
    console.error(`❌ 文件上传失败: ${key}`, error.message);
    throw error;
  }
}

/**
 * 从OSS获取对象
 * @param {string} key - 对象键（路径）
 * @returns {Promise<Object>} 对象内容和元数据
 */
export async function getObject(key) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const result = await ossClient.get(key);
    return result;
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      console.warn(`⚠️ 文件不存在: ${key}`);
      return null;
    }
    console.error(`❌ 文件获取失败: ${key}`, error.message);
    throw error;
  }
}

/**
 * 获取对象的签名URL（用于私有文件的临时访问）
 * @param {string} key - 对象键（路径）
 * @param {number} expires - 过期时间（秒），默认1小时
 * @param {Object} options - 其他选项
 * @returns {Promise<string>} 签名URL
 */
export async function getSignedUrl(key, expires = 3600, options = {}) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const url = ossClient.signatureUrl(key, {
      expires,
      ...options
    });
    
    return url;
  } catch (error) {
    console.error(`❌ 生成签名URL失败: ${key}`, error.message);
    throw error;
  }
}

/**
 * 删除对象
 * @param {string} key - 对象键（路径）
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteObject(key) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const result = await ossClient.delete(key);
    console.log(`✅ 文件删除成功: ${key}`);
    return result;
  } catch (error) {
    console.error(`❌ 文件删除失败: ${key}`, error.message);
    throw error;
  }
}

/**
 * 批量删除对象
 * @param {Array<string>} keys - 对象键数组
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteMultiple(keys) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const result = await ossClient.deleteMulti(keys, { quiet: true });
    console.log(`✅ 批量删除成功: ${keys.length} 个文件`);
    return result;
  } catch (error) {
    console.error('❌ 批量删除失败', error.message);
    throw error;
  }
}

/**
 * 列出对象
 * @param {string} prefix - 前缀（目录）
 * @param {Object} options - 列举选项
 * @returns {Promise<Object>} 对象列表
 */
export async function listObjects(prefix = '', options = {}) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const result = await ossClient.list({
      prefix,
      'max-keys': 1000,
      ...options
    });
    
    return result;
  } catch (error) {
    console.error(`❌ 列举对象失败: ${prefix}`, error.message);
    throw error;
  }
}

/**
 * 检查对象是否存在
 * @param {string} key - 对象键（路径）
 * @returns {Promise<boolean>} 是否存在
 */
export async function exists(key) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    await ossClient.head(key);
    return true;
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return false;
    }
    throw error;
  }
}

/**
 * 复制对象
 * @param {string} sourceKey - 源对象键
 * @param {string} targetKey - 目标对象键
 * @param {Object} options - 复制选项
 * @returns {Promise<Object>} 复制结果
 */
export async function copyObject(sourceKey, targetKey, options = {}) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const result = await ossClient.copy(targetKey, sourceKey, options);
    console.log(`✅ 文件复制成功: ${sourceKey} → ${targetKey}`);
    return result;
  } catch (error) {
    console.error(`❌ 文件复制失败: ${sourceKey} → ${targetKey}`, error.message);
    throw error;
  }
}

/**
 * 获取对象元数据
 * @param {string} key - 对象键（路径）
 * @returns {Promise<Object>} 元数据
 */
export async function getObjectMeta(key) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const result = await ossClient.head(key);
    return result.meta;
  } catch (error) {
    console.error(`❌ 获取元数据失败: ${key}`, error.message);
    throw error;
  }
}

/**
 * 上传本地文件到OSS
 * @param {string} key - OSS对象键
 * @param {string} localPath - 本地文件路径
 * @param {Object} options - 上传选项
 * @returns {Promise<Object>} 上传结果
 */
export async function putFile(key, localPath, options = {}) {
  if (!ossClient) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  try {
    const result = await ossClient.put(key, localPath, options);
    console.log(`✅ 本地文件上传成功: ${localPath} → ${key}`);
    return result;
  } catch (error) {
    console.error(`❌ 本地文件上传失败: ${localPath}`, error.message);
    throw error;
  }
}

/**
 * 生成公开访问URL（适用于公共读的Bucket）
 * @param {string} key - 对象键（路径）
 * @returns {string} 公开URL
 */
export function getPublicUrl(key) {
  if (!config) {
    throw new Error('❌ OSS客户端未初始化，请先调用 initOSS()');
  }
  
  const protocol = config.secure ? 'https' : 'http';
  const endpoint = config.internal 
    ? `${config.bucket}.${config.region}-internal.aliyuncs.com`
    : `${config.bucket}.${config.region}.aliyuncs.com`;
  
  return `${protocol}://${endpoint}/${key}`;
}

/**
 * 获取OSS客户端状态
 * @returns {Object} 状态信息
 */
export function getOSSStatus() {
  if (!ossClient || !config) {
    return { initialized: false };
  }
  
  return {
    initialized: true,
    bucket: config.bucket,
    region: config.region,
    internal: config.internal
  };
}

// 导出默认对象（兼容不同的导入方式）
export default {
  initOSS,
  putObject,
  getObject,
  getSignedUrl,
  deleteObject,
  deleteMultiple,
  listObjects,
  exists,
  copyObject,
  getObjectMeta,
  putFile,
  getPublicUrl,
  getOSSStatus
};

