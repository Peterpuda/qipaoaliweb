// 阿里云配置文件示例
// 复制此文件为 aliyun.config.js 并填写实际配置

export default {
  // RDS MySQL配置
  rds: {
    host: 'rm-xxxxx.mysql.rds.aliyuncs.com',
    port: 3306,
    user: 'app_user',
    password: 'your_strong_password',
    database: 'songbrocade',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  },

  // OSS配置
  oss: {
    region: 'oss-cn-shanghai',
    accessKeyId: 'LTAI5t...',
    accessKeySecret: 'your_access_key_secret',
    bucket: 'songbrocade-media',
    endpoint: 'https://oss-cn-shanghai.aliyuncs.com',
    // 是否使用内网访问（如果在ECS上运行，可以使用内网节省流量费用）
    internal: false
  },

  // 函数计算FC配置
  fc: {
    accountId: 'your_account_id',
    region: 'cn-shanghai',
    serviceName: 'songbrocade-api',
    functionName: 'api-handler',
    triggerUrl: 'https://xxxxx.cn-shanghai.fc.aliyuncs.com/2016-08-15/proxy/songbrocade-api/api-handler/'
  },

  // CDN配置
  cdn: {
    domain: 'www.songbrocade.com',
    // CDN刷新AccessKey（如需自动刷新缓存）
    accessKeyId: 'LTAI5t...',
    accessKeySecret: 'your_access_key_secret'
  },

  // 迁移配置
  migration: {
    // 批量操作的批次大小
    batchSize: 100,
    // 并发数
    concurrency: 5,
    // 重试次数
    retryTimes: 3,
    // 重试延迟（毫秒）
    retryDelay: 1000
  }
};

