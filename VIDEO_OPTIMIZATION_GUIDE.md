# 首页视频优化指南

## 🔍 问题诊断

### 发现的问题
- ❌ **视频文件过大**: 160MB
- ❌ **加载时间长**: 在慢速网络可能需要数分钟
- ❌ **移动端流量消耗大**: 影响用户体验
- ❌ **首屏加载缓慢**: 阻塞页面显示

### 文件信息
```
文件路径: videos/hero-background.mp4
文件大小: 160MB
当前URL: https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background.mp4
```

## ✅ 已实施的优化

### 1. 智能延迟加载
**位置**: `frontend/index.html`

**改进**:
- ✅ 添加 `preload="metadata"` - 只预加载元数据，不预加载视频内容
- ✅ 检测移动设备
- ✅ 检测网络速度（使用 Network Information API）
- ✅ 移动端或慢速网络时，延迟视频加载
- ✅ 等待用户交互（点击/滚动/触摸）后再加载
- ✅ 5秒超时自动开始加载

**代码示例**:
```javascript
// 检测网络状态
const connection = navigator.connection;
const slowConnection = connection && 
  (connection.effectiveType === 'slow-2g' || 
   connection.effectiveType === '2g' || 
   connection.saveData);

// 智能加载策略
if (isMobile || slowConnection) {
  // 延迟加载，等待用户交互
  document.addEventListener('click', startVideoLoading, { once: true });
  setTimeout(startVideoLoading, 5000); // 5秒后自动加载
} else {
  // 桌面端立即加载
  video.load();
}
```

### 2. 渐进式显示
- ✅ 使用 `poster` 属性显示占位图
- ✅ 视频加载时显示淡入效果
- ✅ 加载提示动画

**CSS**:
```css
.video-background {
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.video-background.loaded {
  opacity: 1;
}
```

## 🚀 进一步优化建议

### 方案1: 视频压缩（强烈推荐）

#### 使用FFmpeg压缩

**压缩为高质量（目标: ~20-30MB）**
```bash
ffmpeg -i hero-background.mp4 \
  -c:v libx264 \
  -crf 28 \
  -preset slower \
  -profile:v high \
  -level 4.1 \
  -movflags +faststart \
  -c:a aac \
  -b:a 128k \
  -vf "scale=1920:1080:flags=lanczos" \
  hero-background-optimized.mp4
```

**压缩为中等质量（目标: ~10-15MB）**
```bash
ffmpeg -i hero-background.mp4 \
  -c:v libx264 \
  -crf 32 \
  -preset slower \
  -profile:v main \
  -level 4.0 \
  -movflags +faststart \
  -c:a aac \
  -b:a 96k \
  -vf "scale=1920:1080:flags=lanczos" \
  hero-background-medium.mp4
```

**参数说明**:
- `-crf 28-32`: 质量控制（数值越小质量越高，23-28为高质量，28-35为中等质量）
- `-preset slower`: 使用更慢但压缩率更高的预设
- `-movflags +faststart`: 优化流式播放，元数据前置
- `-vf "scale=1920:1080"`: 调整分辨率（如果原视频过大）

#### 在线压缩工具
如果不想使用命令行，可以使用在线工具:
- **HandBrake**: https://handbrake.fr/
- **CloudConvert**: https://cloudconvert.com/
- **FreeConvert**: https://www.freeconvert.com/video-compressor

### 方案2: 多码率支持

创建不同质量版本，根据网络状况自动选择:

```html
<video id="heroVideo">
  <!-- 高质量版本 (桌面端，快速网络) -->
  <source 
    data-quality="high" 
    src="/videos/hero-background-hd.mp4" 
    type="video/mp4">
  
  <!-- 中等质量 (桌面端，一般网络) -->
  <source 
    data-quality="medium" 
    src="/videos/hero-background-sd.mp4" 
    type="video/mp4">
  
  <!-- 低质量 (移动端) -->
  <source 
    data-quality="low" 
    src="/videos/hero-background-mobile.mp4" 
    type="video/mp4">
</video>
```

**JavaScript 动态选择**:
```javascript
function selectVideoQuality() {
  const connection = navigator.connection;
  const isMobile = window.innerWidth < 768;
  
  if (isMobile || connection?.saveData || connection?.effectiveType === '3g') {
    return 'low';
  } else if (connection?.effectiveType === '4g') {
    return 'high';
  } else {
    return 'medium';
  }
}

const quality = selectVideoQuality();
const source = video.querySelector(`source[data-quality="${quality}"]`);
video.src = source.src;
```

### 方案3: WebM 格式

WebM 格式通常比 MP4 压缩率更高:

```bash
# 转换为 WebM
ffmpeg -i hero-background.mp4 \
  -c:v libvpx-vp9 \
  -crf 35 \
  -b:v 0 \
  -c:a libopus \
  -b:a 96k \
  hero-background.webm
```

**HTML 中使用**:
```html
<video>
  <source src="hero-background.webm" type="video/webm">
  <source src="hero-background.mp4" type="video/mp4">
</video>
```

### 方案4: 使用 CDN

将视频文件放到专业的视频 CDN:

#### Cloudflare Stream
```javascript
// 使用 Cloudflare Stream
<iframe
  src="https://customer-XXXXX.cloudflarestream.com/VIDEO_ID/iframe"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
></iframe>
```

优势:
- ✅ 自动多码率
- ✅ 全球 CDN 加速
- ✅ 自适应流式传输
- ✅ 自动优化

#### 其他 CDN 选项
- **腾讯云 VOD**: https://cloud.tencent.com/product/vod
- **阿里云 VOD**: https://www.aliyun.com/product/vod
- **七牛云**: https://www.qiniu.com/products/dora

### 方案5: 替代方案

#### 使用 GIF 或 WebP 动画
适用于简短的循环动画:
```html
<img 
  src="hero-animation.webp" 
  alt="Hero Animation"
  class="w-full h-full object-cover"
>
```

#### 使用 CSS 动画
如果是简单的背景效果，考虑用纯 CSS:
```css
.animated-gradient {
  background: linear-gradient(
    45deg,
    #9E2A2B, #D5BDAF, #D4AF37, #9E2A2B
  );
  background-size: 400% 400%;
  animation: gradientFlow 15s ease infinite;
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

## 📊 性能对比

| 方案 | 文件大小 | 加载时间(4G) | 加载时间(3G) | 质量 | 难度 |
|------|---------|--------------|--------------|------|------|
| **当前** | 160MB | ~30-40秒 | ~2-3分钟 | 极高 | - |
| **FFmpeg压缩(高质)** | 20-30MB | ~5-8秒 | ~20-30秒 | 高 | ⭐ |
| **FFmpeg压缩(中质)** | 10-15MB | ~2-4秒 | ~10-15秒 | 中 | ⭐ |
| **多码率** | 10-50MB | 自适应 | 自适应 | 自适应 | ⭐⭐ |
| **WebM格式** | 15-25MB | ~3-5秒 | ~15-20秒 | 高 | ⭐ |
| **CDN(Stream)** | N/A | <2秒 | ~5秒 | 自适应 | ⭐⭐⭐ |

## 🛠️ 立即可实施的优化

### 快速优化（已完成）✅
1. ✅ 添加智能延迟加载
2. ✅ 移动端等待用户交互
3. ✅ 网络速度检测
4. ✅ 使用 preload="metadata"

### 下一步（强烈推荐）
1. **压缩视频文件** ⭐⭐⭐⭐⭐
   - 使用 FFmpeg 或在线工具
   - 目标: 减少到 20-30MB
   - 预期效果: 加载速度提升 80%

2. **上传到 R2 并配置 CDN**
   ```bash
   # 压缩后上传
   wrangler r2 object put poap-images/videos/hero-background-optimized.mp4 \
     --file=hero-background-optimized.mp4
   ```

3. **更新前端引用**
   ```html
   <source src="https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background-optimized.mp4" 
           type="video/mp4">
   ```

## 📱 移动端优化建议

### 创建移动端专用版本
```bash
# 移动端版本（低分辨率，高压缩）
ffmpeg -i hero-background.mp4 \
  -c:v libx264 \
  -crf 35 \
  -vf "scale=1280:720" \
  -preset slower \
  -movflags +faststart \
  -c:a aac \
  -b:a 64k \
  hero-background-mobile.mp4
```

### 使用 srcset 概念
```javascript
if (window.innerWidth < 768) {
  video.src = '/videos/hero-background-mobile.mp4'; // 5-8MB
} else {
  video.src = '/videos/hero-background-desktop.mp4'; // 20-30MB
}
```

## 🎯 推荐实施步骤

### 第一步: 压缩当前视频（立即执行）
```bash
# 安装 FFmpeg (如果还没安装)
# Mac: brew install ffmpeg
# Windows: https://ffmpeg.org/download.html

# 进入视频目录
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/videos/

# 压缩视频（高质量版本）
ffmpeg -i hero-background.mp4 \
  -c:v libx264 \
  -crf 28 \
  -preset slower \
  -movflags +faststart \
  -c:a aac \
  -b:a 128k \
  hero-background-optimized.mp4

# 创建移动端版本
ffmpeg -i hero-background.mp4 \
  -c:v libx264 \
  -crf 35 \
  -vf "scale=1280:720" \
  -preset slower \
  -movflags +faststart \
  -c:a aac \
  -b:a 64k \
  hero-background-mobile.mp4
```

### 第二步: 上传到 R2
```bash
cd worker-api
wrangler r2 object put poap-images/videos/hero-background-optimized.mp4 --file=../videos/hero-background-optimized.mp4
wrangler r2 object put poap-images/videos/hero-background-mobile.mp4 --file=../videos/hero-background-mobile.mp4
```

### 第三步: 更新前端代码
修改 `frontend/index.html`:
```html
<video id="heroVideo">
  <source 
    id="videoSource"
    src="https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background-optimized.mp4" 
    type="video/mp4">
</video>

<script>
// 根据设备选择视频
const isMobile = window.innerWidth < 768;
const videoSrc = isMobile 
  ? '/storage/public/videos/hero-background-mobile.mp4'
  : '/storage/public/videos/hero-background-optimized.mp4';
document.getElementById('videoSource').src = 
  'https://songbrocade-api.petterbrand03.workers.dev' + videoSrc;
</script>
```

## ✅ 预期效果

实施压缩后:
- 📉 文件大小: 160MB → 20-30MB (桌面) / 5-8MB (移动)
- ⚡ 加载时间: 30-40秒 → 5-8秒 (桌面) / 2-3秒 (移动)
- 💾 流量节省: 85% (桌面) / 95% (移动)
- 🎨 视觉质量: 几乎无损

## 🔧 测试清单

压缩后测试:
- [ ] 桌面端视频加载速度
- [ ] 移动端视频加载速度
- [ ] 视频画质是否可接受
- [ ] 循环播放是否流畅
- [ ] 控制按钮是否正常
- [ ] 不同网络速度下的表现

## 📚 参考资源

- FFmpeg官方文档: https://ffmpeg.org/documentation.html
- Web视频优化指南: https://web.dev/fast/#optimize-your-videos
- Cloudflare Stream文档: https://developers.cloudflare.com/stream/
- 视频压缩最佳实践: https://www.adobe.com/creativecloud/video/discover/best-video-format.html

## 💡 总结

**当前状态**:
- ✅ 已实施智能延迟加载
- ✅ 已添加网络检测
- ⚠️ 视频文件仍然过大（160MB）

**下一步行动**:
1. **立即**: 使用 FFmpeg 压缩视频（减少 85% 文件大小）
2. **短期**: 上传压缩后的视频到 R2
3. **长期**: 考虑使用 Cloudflare Stream 或其他视频CDN

**最大收益**: 压缩视频文件是最简单、最有效的优化方式，可以立即带来巨大改善！

