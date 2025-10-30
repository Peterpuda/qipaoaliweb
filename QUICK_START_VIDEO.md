# 🎬 视频背景快速上手指南

## ✅ 已完成的工作

**所有代码已实现并部署！** 现在只需要你提供视频文件即可。

---

## 📍 当前部署

- **最新部署**: https://0b9e16e4.poap-checkin-frontend.pages.dev
- **生产环境**: https://prod.poap-checkin-frontend.pages.dev

---

## 🎯 你需要做的（3 步）

### 步骤 1: 准备视频文件

**文件命名**: `hero-background.mp4`

**推荐规格**:
- 格式: MP4 (H.264)
- 分辨率: 1920x1080
- 时长: 10-30 秒
- 文件大小: < 10 MB
- 内容: 非遗手工艺场景（暗色调）

**哪里找视频**:
- 自己拍摄
- Pexels: https://www.pexels.com/search/videos/handicraft/
- Pixabay: https://pixabay.com/videos/search/traditional%20craft/

---

### 步骤 2: 放置视频文件

**两种方式任选其一**：

#### 方式 A：本地文件（推荐测试）

```bash
# 将视频复制到 videos 目录
cp your-video.mp4 frontend/videos/hero-background.mp4

# 部署
cd frontend
npx wrangler pages deploy . --project-name=poap-checkin-frontend --branch=prod
```

#### 方式 B：Cloudflare R2（推荐生产）

1. 登录 Cloudflare Dashboard
2. R2 Buckets → `poap-images`
3. 创建 `videos` 文件夹
4. 上传 `hero-background.mp4`
5. 修改 `frontend/index.html` 第 334 行：
   ```html
   <source src="https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background.mp4" type="video/mp4">
   ```
6. 重新部署前端

---

### 步骤 3: 测试效果

1. 访问: https://0b9e16e4.poap-checkin-frontend.pages.dev
2. 查看首页英雄区域
3. 测试功能：
   - ✅ 视频是否播放
   - ✅ 点击 🔇 开启声音
   - ✅ 点击 ⏸️ 暂停/播放
   - ✅ 移动端查看（应该不显示视频）

---

## 🎨 效果说明

### 有视频时

```
┌──────────────────────────────────┐
│  🎥 视频背景（暗色、循环）        │
│     ↓ 渐变遮罩                   │
│                                  │
│       手艺在链上                  │
│       传承在未来                  │
│                                  │
│   [探索匠人世界] [加入...]        │
│                                  │
│                   🔊 ⏸️ ← 控制    │
└──────────────────────────────────┘
```

### 没有视频时

```
┌──────────────────────────────────┐
│  渐变背景（原样式）               │
│                                  │
│       手艺在链上                  │
│       传承在未来                  │
│                                  │
│   [探索匠人世界] [加入...]        │
└──────────────────────────────────┘
```

**不用担心**：即使没有视频文件，页面也能正常显示！

---

## 💡 功能特性

### ✅ 已实现的功能

1. **自动播放**: 页面加载后自动播放（静音）
2. **循环播放**: 视频结束后自动重新开始
3. **声音控制**: 点击按钮开启/关闭声音
4. **播放控制**: 点击按钮暂停/播放
5. **加载提示**: 视频加载时显示 "加载视频中..."
6. **错误处理**: 视频加载失败时自动隐藏
7. **移动端优化**: 手机端不加载视频（节省流量）
8. **页面切换**: 切换标签页时自动暂停
9. **渐变遮罩**: 确保白色文字清晰可读
10. **透明度控制**: 视频不会过于抢眼

---

## 🔧 自定义调整

### 调整视频透明度

找到 `frontend/index.html` 第 168 行：

```css
.video-background.loaded {
  opacity: 0.4;  /* 改为 0.1-0.6 之间的值 */
}
```

- `0.1` = 非常淡（几乎看不见）
- `0.4` = 适中（当前值，推荐）
- `0.6` = 较明显

---

### 调整遮罩强度

找到第 177-182 行：

```css
.video-overlay {
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 10, 0.7) 0%,   /* 顶部暗度 */
    rgba(10, 10, 10, 0.5) 50%,  /* 中间暗度 */
    rgba(10, 10, 10, 0.8) 100%  /* 底部暗度 */
  );
}
```

数值越大 = 越暗 = 文字越清晰

---

## 📱 移动端说明

**移动端（< 768px）会自动禁用视频**

原因：
- 节省流量
- 提升性能
- 节省电量
- 改善用户体验

如果你想在移动端也显示视频，删除第 240-246 行的代码。

---

## 🐛 故障排除

### 问题 1: 视频不显示

**检查**:
1. 文件是否存在: `frontend/videos/hero-background.mp4`
2. 文件命名是否正确（区分大小写）
3. 浏览器控制台是否有错误

**解决**:
```bash
# 检查文件
ls -lh frontend/videos/

# 重新部署
cd frontend
npx wrangler pages deploy . --project-name=poap-checkin-frontend --branch=prod
```

---

### 问题 2: 视频有但不播放

**检查**:
1. 浏览器是否支持 MP4
2. 视频编码是否为 H.264
3. 是否是移动端（移动端不显示视频）

**解决**:
```bash
# 转换视频格式
ffmpeg -i input.mp4 -c:v libx264 -c:a aac hero-background.mp4
```

---

### 问题 3: 没有声音

**这是正常的！**

视频默认静音。点击右下角的 🔇 按钮开启声音。

---

### 问题 4: 视频太大，加载慢

**优化**:
```bash
# 压缩视频（保持质量）
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow \
       -c:a aac -b:a 128k -vf scale=1920:1080 \
       hero-background.mp4
```

目标: < 10 MB

---

## 📊 性能监控

打开浏览器控制台（F12），查看：

```
✅ "视频背景控制初始化完成"
✅ "视频加载完成"
✅ "视频自动播放成功"
```

如果看到错误，说明有问题需要修复。

---

## 🎁 推荐视频内容

### 场景建议

1. **刺绣特写**
   - 针线穿梭
   - 手部动作
   - 丝线细节

2. **编织工艺**
   - 织机运作
   - 纺线场景
   - 材质纹理

3. **陶艺制作**
   - 拉坯过程
   - 手工塑形
   - 工具特写

4. **木雕技艺**
   - 雕刻动作
   - 木屑飞舞
   - 作品细节

### 拍摄技巧

- 使用慢动作（60 fps 拍摄，30 fps 输出）
- 暗色背景或场景
- 侧光或背光（增加神秘感）
- 避免过多快速运动
- 首尾镜头相似（循环友好）

---

## 📞 需要帮助？

如果遇到问题，提供以下信息：

1. 浏览器控制台日志（F12）
2. 视频文件信息（大小、格式）
3. 部署 URL
4. 截图

---

## 🎉 总结

### 已完成 ✅

- [x] CSS 样式
- [x] HTML 结构
- [x] JavaScript 逻辑
- [x] 目录创建
- [x] 文档编写
- [x] 代码部署

### 等待你 ⏳

- [ ] 准备视频文件
- [ ] 放置到正确位置
- [ ] 测试效果
- [ ] 享受成果 🎊

---

**现在访问**: https://0b9e16e4.poap-checkin-frontend.pages.dev

**准备好视频后，按照上面的步骤操作即可！**

祝你成功！🚀

