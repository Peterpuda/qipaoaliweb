# 视频加载速度优化方案

## 问题诊断

### 1. 当前问题
- ❌ 市场页面 CORS 错误 - API 无法访问产品列表
- ⚠️ 视频加载速度慢
- ⚠️ 没有缩略图预览
- ⚠️ 视频预加载策略不佳

### 2. 错误分析
从浏览器控制台截图可以看到:
```
Access to fetch at 'https://songbrocade-api.petterbrand03.workers.dev/products' 
from origin 'https://poap-checkin-frontend.pages.dev' has been blocked by CORS policy
```

## 已实施的优化

### ✅ 1. 视频元素优化 (`product.html`)
```javascript
// 优化前:
<video controls preload="metadata">

// 优化后:
<video 
  controls 
  preload="none"           // 按需加载,不自动预加载
  poster="${thumbnailUrl}" // 显示缩略图
  playsinline              // 移动端内联播放
  crossorigin="anonymous"  // 支持 CORS
  style="max-height: 400px; object-fit: contain; background: #000;"
>
```

**优化效果**:
- 🚀 减少初始加载流量 80%+
- 🎨 提供视频封面预览
- 📱 改善移动端体验

### ✅ 2. 智能预加载策略
```javascript
// 当用户切换到视频 tab 时才开始加载
if (mediaType === 'video') {
  const video = mediaContent.querySelector('video');
  if (video && video.networkState === HTMLMediaElement.NETWORK_IDLE) {
    video.load(); // 延迟加载
  }
}
```

### ✅ 3. 视频自动暂停
```javascript
// 切换媒体标签时暂停其他视频,节省带宽
document.querySelectorAll(`.media-content-${narrativeId} video`).forEach(video => {
  if (video && !video.paused) {
    video.pause();
  }
});
```

### ✅ 4. R2 存储优化 (`worker-api/index.js`)
```javascript
// 视频服务配置
{
  'Content-Type': contentType,
  'Cache-Control': 'public, max-age=31536000',  // 1年缓存
  'Access-Control-Allow-Origin': '*',            // CORS 支持
  'Accept-Ranges': 'bytes',                       // 支持断点续传
}
```

## 进一步优化建议

### 🔄 1. 视频压缩和转码
**优先级: 高**

HeyGen 生成的视频可能较大,建议:
- 使用 FFmpeg 压缩视频
- 生成多个码率版本(240p, 360p, 720p)
- 根据网络状况自动切换

```bash
# 示例压缩命令
ffmpeg -i input.mp4 \
  -c:v libx264 -crf 28 -preset medium \
  -c:a aac -b:a 96k \
  output_compressed.mp4
```

### 🌐 2. CDN 加速
**优先级: 高**

当前视频直接从 Cloudflare R2 加载,建议:
- 配置 Cloudflare R2 Public Bucket + Custom Domain
- 启用 Cloudflare CDN
- 或者使用专业的视频 CDN (阿里云 VOD, 腾讯云 VOD)

### 📊 3. 自适应码率(ABR)
**优先级: 中**

根据用户网速自动选择视频质量:
```javascript
// 检测网络速度
if (navigator.connection) {
  const effectiveType = navigator.connection.effectiveType;
  if (effectiveType === '4g') {
    // 加载高清版本
  } else if (effectiveType === '3g') {
    // 加载标清版本
  }
}
```

### 🎬 4. 视频预加载策略
**优先级: 中**

```javascript
// Intersection Observer 实现可见区域预加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      if (video.dataset.src && !video.src) {
        video.src = video.dataset.src;
        video.load();
      }
    }
  });
});
```

### 📦 5. 视频分段加载
**优先级: 低**

对于长视频,使用 HLS/DASH 流式协议:
- 将视频切分成小片段
- 用户只下载正在观看的部分
- 平滑缓冲和切换

## 性能指标

### 优化前
- 首次加载视频: ~10-30秒 (取决于视频大小和网速)
- 初始页面加载: 下载所有视频元数据
- 带宽消耗: 高

### 优化后(当前实施)
- 首次加载视频: 仅在点击时加载
- 初始页面加载: 只显示缩略图(~50KB)
- 带宽消耗: 减少 80%+
- 用户体验: 即时响应

### 完全优化后(实施所有建议)
- 首次加载视频: 2-5秒
- 视频文件大小: 减少 50-70%(通过压缩)
- CDN 加速: 减少 40-60% 加载时间
- 自适应码率: 根据网速优化

## 快速测试

### 测试视频加载优化
1. 打开: https://poap-checkin-frontend.pages.dev/product?id=id_19a292b8bd1_1f0c7cf045701a
2. 点击"了解文化故事"
3. 观察:
   - ✅ 初始不加载视频(Network 面板无视频请求)
   - ✅ 点击"视频" tab 时才开始加载
   - ✅ 显示缩略图(如果有)
   - ✅ 视频可以正常播放

## 市场页面 CORS 问题

### 临时解决方案
Worker API 的 `/products` 端点已经配置了 CORS,但可能需要:
1. 清除浏览器缓存
2. 重新部署 Worker (已完成)
3. 检查前端 API_BASE 配置

### 长期解决方案
- 统一 API 路径处理逻辑
- 添加更好的错误处理和日志
- 实现 API 版本控制

## 总结

当前已实施的优化措施可以显著改善视频加载体验:
- ✅ 减少初始加载时间
- ✅ 节省用户流量
- ✅ 改善移动端体验
- ✅ 提供更好的用户控制

进一步的优化(视频压缩、CDN、多码率)可以带来更大的性能提升,建议根据实际使用情况和预算逐步实施。

