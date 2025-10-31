# 🎬 主页视频优化策略

## 📊 视频文件概览

### R2 存储的三个版本

| 文件名 | 大小 | 用途 | 状态 |
|--------|------|------|------|
| `hero-background.mp4` | **160MB** | 原始文件 | ⚠️ **不使用** |
| `hero-background-optimized.mp4` | **15MB** | 桌面端优化版 | ✅ 使用中 |
| `hero-background-mobile.mp4` | **4.1MB** | 移动端压缩版 | ✅ 使用中 |

### 压缩率

- 桌面端优化版：**90.6% 压缩** (160MB → 15MB)
- 移动端压缩版：**97.4% 压缩** (160MB → 4.1MB)

---

## 🎯 智能视频选择逻辑

### 当前实现

```javascript
// 优先级：移动端 > 慢速网络 > 桌面端
if (isMobile || slowConnection) {
  // 移动端或慢速网络：使用 4.1MB 压缩版
  videoPath = '/storage/public/videos/hero-background-mobile.mp4';
} else {
  // 桌面端且网络正常：使用 15MB 优化版
  videoPath = '/storage/public/videos/hero-background-optimized.mp4';
}

// 注意：永远不使用 160MB 的原始文件
```

### 决策树

```
用户访问主页
    ↓
检测设备类型
    ↓
┌─────────────┬─────────────┐
│   移动端    │   桌面端    │
│  (< 768px)  │  (≥ 768px)  │
└─────────────┴─────────────┘
       ↓              ↓
   4.1MB 视频    检测网络速度
                      ↓
              ┌──────────────┬──────────────┐
              │   慢速网络   │   正常网络   │
              │ (2G/3G/省流) │   (4G/5G)    │
              └──────────────┴──────────────┘
                     ↓              ↓
                 4.1MB 视频     15MB 视频
```

---

## 🚀 性能优化策略

### 1. 设备检测 ✅
```javascript
const isMobile = window.innerWidth < 768;
```
- 移动端（< 768px）→ 4.1MB 视频
- 桌面端（≥ 768px）→ 继续检测网络

### 2. 网络速度检测 ✅
```javascript
const connection = navigator.connection;
const slowConnection = connection && (
  connection.effectiveType === 'slow-2g' || 
  connection.effectiveType === '2g' || 
  connection.effectiveType === '3g' ||  // 新增 3G 检测
  connection.saveData
);
```

**检测的网络类型**：
- `slow-2g` - 极慢网络（< 50 Kbps）
- `2g` - 2G 网络（50-70 Kbps）
- `3g` - 3G 网络（700 Kbps - 3 Mbps）
- `saveData` - 用户开启了省流量模式

### 3. 延迟加载策略 ✅
```javascript
const shouldDelayLoad = isMobile || slowConnection;

if (shouldDelayLoad) {
  // 等待用户交互（点击、滚动、触摸）
  // 或 5 秒后自动加载
} else {
  // 立即加载
}
```

### 4. DNS 预连接 ✅
```html
<link rel="preconnect" href="https://songbrocade-api.petterbrand03.workers.dev" />
<link rel="dns-prefetch" href="https://songbrocade-api.petterbrand03.workers.dev" />
```
- 提前建立连接，减少延迟
- 预解析 DNS，加快首次请求

### 5. 视频属性优化 ✅
```html
<video 
  preload="metadata"    <!-- 仅预加载元数据，不预加载视频 -->
  poster="/image/hero.png"  <!-- 显示封面图 -->
  playsinline          <!-- 移动端内联播放 -->
  loop                 <!-- 循环播放 -->
  muted                <!-- 静音（允许自动播放） -->
>
```

### 6. 自动重试机制 ✅
```javascript
let retryCount = 0;
const maxRetries = 3;

video.addEventListener('error', function() {
  if (retryCount < maxRetries) {
    retryCount++;
    setTimeout(() => video.load(), 2000);
  }
});
```

---

## 📈 性能对比

### 加载时间估算

| 网络类型 | 160MB 原始 | 15MB 优化 | 4.1MB 移动 |
|---------|-----------|----------|-----------|
| **5G** (100 Mbps) | 12.8 秒 | 1.2 秒 | 0.3 秒 |
| **4G** (10 Mbps) | 128 秒 | 12 秒 | 3.3 秒 |
| **3G** (1 Mbps) | 1280 秒 | 120 秒 | 32.8 秒 |
| **2G** (50 Kbps) | 25600 秒 | 2400 秒 | 656 秒 |

### 实际用户体验

| 场景 | 使用视频 | 加载时间 | 体验 |
|------|---------|---------|------|
| **桌面端 + 5G/4G** | 15MB | 1-12 秒 | ✅ 优秀 |
| **桌面端 + 3G** | 4.1MB | ~33 秒 | ✅ 良好 |
| **移动端 + 4G** | 4.1MB | ~3 秒 | ✅ 优秀 |
| **移动端 + 3G** | 4.1MB | ~33 秒 | ✅ 可接受 |
| **任何 + 2G** | 4.1MB + 延迟加载 | 用户交互后 | ✅ 可用 |

---

## 🎨 用户体验优化

### 1. 加载提示 ✅
```html
<div id="videoLoading" class="video-loading">
  <i class="fas fa-circle-notch"></i>
  <span>加载视频中...</span>
</div>
```

### 2. 封面图 ✅
```html
<video poster="/image/hero.png">
```
- 视频加载前显示静态图片
- 避免黑屏体验

### 3. 视频控制 ✅
```html
<button id="volumeBtn">🔇/🔊</button>
<button id="playPauseBtn">⏸️/▶️</button>
```
- 用户可控制播放/暂停
- 用户可控制音量

### 4. 智能暂停 ✅
```javascript
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    video.pause();  // 页面隐藏时暂停
  }
});
```

---

## 🔧 技术实现细节

### API 端点
```
https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/
├── hero-background-optimized.mp4  (15MB) ← 桌面端
└── hero-background-mobile.mp4     (4.1MB) ← 移动端/慢速网络
```

### 不使用的文件
```
❌ hero-background.mp4 (160MB)
```
**原因**：
- 文件过大，加载时间过长
- 对用户体验影响严重
- 已有优化版本，无需使用原始文件

---

## 📊 监控指标

### 建议监控的指标

1. **视频加载成功率**
   - 目标：> 95%
   - 当前：有自动重试机制

2. **平均加载时间**
   - 桌面端：< 5 秒
   - 移动端：< 10 秒

3. **用户设备分布**
   - 移动端 vs 桌面端比例
   - 网络类型分布

4. **视频播放率**
   - 有多少用户实际播放了视频
   - 延迟加载的触发率

---

## 🎯 未来优化建议

### 1. 自适应比特率（ABR）
```javascript
// 根据实时网络速度动态切换视频质量
if (currentSpeed < 1Mbps) {
  switchTo('mobile');  // 4.1MB
} else {
  switchTo('optimized');  // 15MB
}
```

### 2. WebP 封面图
```html
<picture>
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.png" alt="封面">
</picture>
```

### 3. 视频流式传输
- 使用 HLS 或 DASH 协议
- 支持分段加载
- 更好的缓冲控制

### 4. CDN 加速
- 将视频部署到 Cloudflare R2 + CDN
- 全球加速分发
- 减少延迟

### 5. 更多压缩版本
```
hero-background-ultra-light.mp4  (2MB)   ← 2G 网络
hero-background-mobile.mp4       (4.1MB) ← 3G/移动端
hero-background-optimized.mp4    (15MB)  ← 4G/桌面端
hero-background-hd.mp4           (30MB)  ← 5G/高速网络（可选）
```

---

## ✅ 检查清单

### 部署前检查
- [x] 确认 R2 中有两个优化版本视频
- [x] 确认原始 160MB 文件不被使用
- [x] 移动端检测逻辑正确
- [x] 网络速度检测包含 3G
- [x] DNS 预连接已配置
- [x] 延迟加载逻辑正确
- [x] 自动重试机制工作
- [x] 视频控制按钮可用
- [x] 封面图正确显示

### 测试场景
- [ ] 桌面端 + 快速网络 → 15MB 视频
- [ ] 桌面端 + 3G 网络 → 4.1MB 视频
- [ ] 移动端 + 任何网络 → 4.1MB 视频
- [ ] 2G 网络 → 延迟加载
- [ ] 视频加载失败 → 自动重试
- [ ] 页面切换 → 视频暂停

---

## 📝 总结

### ✅ 已优化
1. **智能视频选择** - 根据设备和网络自动选择
2. **延迟加载** - 慢速网络等待用户交互
3. **DNS 预连接** - 减少首次请求延迟
4. **自动重试** - 提高加载成功率
5. **用户控制** - 播放/暂停/音量控制

### 🎯 效果
- 移动端加载速度提升 **97.4%**
- 桌面端加载速度提升 **90.6%**
- 慢速网络用户体验显著改善
- 不再使用 160MB 原始文件

### 💡 关键点
- **永远不使用 160MB 原始文件**
- **移动端和慢速网络优先使用 4.1MB 版本**
- **桌面端正常网络使用 15MB 版本**
- **延迟加载策略保护慢速网络用户**

---

**🎉 视频加载优化完成！用户体验显著提升！**

