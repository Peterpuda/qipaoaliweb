# R2 视频文件位置说明

## ✅ 视频文件位置

### R2 存储桶信息

```
存储桶名称: poap-images
文件路径: videos/hero-background.mp4
完整路径: poap-images/videos/hero-background.mp4
文件大小: 160 MB
```

---

## 🔍 重要说明

### 之前的问题

第一次上传时使用了 **本地模式**（`--local`），文件只上传到了本地模拟环境，**没有上传到真正的 Cloudflare R2**。

```bash
# ❌ 错误：本地模式（默认）
npx wrangler r2 object put poap-images/videos/hero-background.mp4 \
  --file=frontend/videos/hero-background.mp4

# 输出：Resource location: local ⚠️
```

### 正确的上传方式

**必须添加 `--remote` 参数**，才能上传到真正的 Cloudflare R2：

```bash
# ✅ 正确：远程模式
npx wrangler r2 object put poap-images/videos/hero-background.mp4 \
  --file=frontend/videos/hero-background.mp4 \
  --remote

# 输出：Resource location: remote ✅
```

---

## 📍 在 Cloudflare Dashboard 查看

### 步骤 1：登录 Cloudflare
访问：https://dash.cloudflare.com/

### 步骤 2：进入 R2
左侧菜单 → **R2** → **Overview**

### 步骤 3：选择存储桶
点击 **poap-images** 存储桶

### 步骤 4：查看文件
你应该能看到：

```
📁 videos/
  └── 📹 hero-background.mp4 (160 MB)
```

---

## 🔗 访问 URL

### 通过 Worker API 访问

```
https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background.mp4
```

### URL 结构

```
https://songbrocade-api.petterbrand03.workers.dev  ← Worker 域名
  /storage/public/                                 ← API 路由
    videos/hero-background.mp4                     ← R2 文件路径
```

---

## 🛠️ 管理命令

### 查看文件信息
```bash
npx wrangler r2 object get poap-images/videos/hero-background.mp4 --remote
```

### 删除文件
```bash
npx wrangler r2 object delete poap-images/videos/hero-background.mp4 --remote
```

### 重新上传
```bash
npx wrangler r2 object put poap-images/videos/hero-background.mp4 \
  --file=frontend/videos/hero-background.mp4 \
  --remote
```

---

## ✅ 当前状态

- [x] 视频已上传到远程 R2
- [x] 位置：`poap-images/videos/hero-background.mp4`
- [x] 可通过 Worker API 访问
- [x] 前端代码已配置正确的 URL
- [x] 已部署到生产环境

---

## 🧪 测试访问

### 方法 1：浏览器直接访问
```
https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background.mp4
```

### 方法 2：curl 命令
```bash
curl -I https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background.mp4
```

应该返回：
```
HTTP/2 200 
content-type: video/mp4
content-length: 167772160
cache-control: public, max-age=31536000
```

---

## 📊 R2 存储桶结构

```
poap-images/
├── videos/                          ← 新增
│   └── hero-background.mp4         ← 160 MB
├── products/                        ← 商品图片
│   ├── [product_id].jpg
│   └── ...
├── artisans/                        ← 匠人图片
│   ├── [artisan_id].jpg
│   └── ...
└── narratives/                      ← 文化叙事多媒体
    ├── [narrative_id]_audio.mp3
    ├── [narrative_id]_video.mp4
    └── ...
```

---

## 💡 为什么使用 R2？

### 优势

| 特性 | 说明 |
|------|------|
| **无限制文件大小** | 支持 GB 级别文件 |
| **全球 CDN** | Cloudflare 边缘网络 |
| **低成本** | 免费：10 GB 存储 + 10M 请求/月 |
| **高性能** | 自动缓存，低延迟 |
| **安全** | 通过 Worker API 代理访问 |

### 对比 Cloudflare Pages

| 对比项 | Pages | R2 |
|--------|-------|-----|
| **文件大小限制** | 25 MB | 无限制 ✅ |
| **适用场景** | 静态资源 | 大文件、媒体 ✅ |
| **部署速度** | 慢（大文件） | 快 ✅ |

---

## 🎯 关键要点

1. **必须使用 `--remote`**：否则只上传到本地模拟环境
2. **路径结构**：`存储桶名/文件夹/文件名`
3. **访问方式**：通过 Worker API 的 `/storage/public/` 路由
4. **前端配置**：`frontend/index.html` 已正确配置 URL

---

## ✨ 完成！

视频现在已经正确存储在：
```
☁️ Cloudflare R2
  └── 📦 poap-images
      └── 📁 videos
          └── 🎬 hero-background.mp4 (160 MB)
```

访问地址：
```
https://songbrocade-api.petterbrand03.workers.dev/storage/public/videos/hero-background.mp4
```

**你现在可以在 Cloudflare Dashboard 的 R2 界面看到这个文件了！** 🎉

