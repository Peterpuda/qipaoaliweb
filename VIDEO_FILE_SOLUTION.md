# 视频文件上传解决方案

**问题**: 视频文件 160 MB，超过 Cloudflare Pages 限制（25 MB）

---

## 🚫 当前问题

```
文件名: hero-background.mp4.mp4  ❌ (双后缀)
文件大小: 160 MB  ❌ (超过限制)
Cloudflare Pages 限制: 25 MB
```

---

## ✅ 解决方案：使用 Cloudflare R2

### 方案 A：压缩视频（推荐）

**第一步：压缩视频到 10 MB 以下**

使用 FFmpeg 压缩：
```bash
# 高质量压缩（目标 10 MB）
ffmpeg -i hero-background.mp4.mp4 -c:v libx264 -crf 28 -preset slow \
       -vf "scale=1920:1080" -c:a aac -b:a 128k \
       -movflags +faststart \
       frontend/videos/hero-background.mp4

# 或更激进的压缩（目标 5 MB）
ffmpeg -i hero-background.mp4.mp4 -c:v libx264 -crf 32 -preset slow \
       -vf "scale=1280:720" -c:a aac -b:a 96k \
       -movflags +faststart \
       frontend/videos/hero-background.mp4
```

**参数说明**:
- `-crf 28-32`: 质量控制（越大越小，28 = 高质量，32 = 中等质量）
- `scale=1280:720`: 降低分辨率（可选）
- `-b:a 128k`: 音频码率
- `-movflags +faststart`: 优化网页播放

---

### 方案 B：上传到 Cloudflare R2

**第一步：上传视频到 R2**

1. 登录 Cloudflare Dashboard
2. 进入 R2 Buckets → `poap-images`
3. 创建文件夹 `videos`
4. 上传 `hero-background.mp4`

**第二步：修改前端代码**

将 `frontend/index.html` 第 334 行改为：
```html
<source src="https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background.mp4" type="video/mp4">
```

**第三步：后端支持**

确保 `worker-api/index.js` 有以下路由：
```javascript
if (pathname.startsWith('/storage/public/')) {
  const key = pathname.replace('/storage/public/', '');
  const object = await env.R2_BUCKET.get(key);
  
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000',
    }
  });
}
```

---

### 方案 C：使用外部 CDN

如果你有其他 CDN，可以上传到那里：

```html
<source src="https://your-cdn.com/hero-background.mp4" type="video/mp4">
```

---

## 🎯 推荐方案

**我推荐方案 A：压缩视频**

原因：
- ✅ 最简单
- ✅ 不需要额外配置
- ✅ 加载速度更快
- ✅ 节省流量

---

## 🔧 快速操作步骤

### 如果你有 FFmpeg

```bash
# 1. 进入目录
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/frontend/videos

# 2. 压缩视频
ffmpeg -i hero-background.mp4.mp4 -c:v libx264 -crf 28 -preset slow \
       -vf "scale=1920:1080" -c:a aac -b:a 128k \
       -movflags +faststart \
       hero-background.mp4

# 3. 删除原文件
rm hero-background.mp4.mp4

# 4. 检查文件大小
ls -lh hero-background.mp4

# 5. 如果还是太大，再压缩一次
ffmpeg -i hero-background.mp4 -c:v libx264 -crf 32 -preset slow \
       -vf "scale=1280:720" -c:a aac -b:a 96k \
       -movflags +faststart \
       hero-background-compressed.mp4
```

### 如果没有 FFmpeg

**安装 FFmpeg**:
```bash
# macOS
brew install ffmpeg

# 或使用在线压缩工具
# https://www.freeconvert.com/video-compressor
# https://www.videosmaller.com/
```

---

## 📊 压缩目标

| 分辨率 | CRF | 预计大小 | 质量 |
|--------|-----|----------|------|
| 1920x1080 | 28 | ~15 MB | 高 |
| 1920x1080 | 32 | ~8 MB | 中高 |
| 1280x720 | 28 | ~8 MB | 中高 |
| 1280x720 | 32 | ~4 MB | 中等 |

**推荐**: 1920x1080, CRF 28-30（在质量和大小间平衡）

---

## 🚀 临时解决方案

在压缩视频之前，我会先部署不包含视频文件的版本：

```bash
# 临时移除视频文件
cd frontend/videos
mv hero-background.mp4.mp4 ~/Desktop/

# 部署
cd ..
npx wrangler pages deploy . --project-name=poap-checkin-frontend --branch=prod

# 压缩完成后再放回来
```

---

## 📝 注意事项

1. **文件命名**: 
   - ❌ `hero-background.mp4.mp4` （双后缀）
   - ✅ `hero-background.mp4` （单后缀）

2. **文件大小**: 
   - ❌ 160 MB （太大）
   - ✅ < 10 MB （推荐）
   - ⚠️ 10-25 MB （可接受）

3. **视频质量**:
   - 网页背景视频不需要超高清
   - 1280x720 对于背景已经足够
   - 适当降低质量用户不会注意到

---

## 🎬 测试建议

压缩后，本地测试：
```bash
cd frontend
python3 -m http.server 8080
# 访问 http://localhost:8080
```

检查：
- [ ] 视频是否流畅播放
- [ ] 画质是否可接受
- [ ] 音频是否清晰
- [ ] 文件大小是否 < 25 MB

---

**下一步**: 请告诉我你想用哪个方案，我帮你操作！

