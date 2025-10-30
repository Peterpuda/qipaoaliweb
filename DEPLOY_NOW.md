# 🚀 立即部署 - 快速指南

## 📋 3 步完成部署

### 第 1 步：登录 Cloudflare (1分钟)

打开终端，运行：

```bash
wrangler login
```

这会打开浏览器让你授权。点击 "Allow" 即可。

---

### 第 2 步：运行部署脚本 (2-5分钟)

```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26
./deploy.sh
```

选择 `3` (全部部署)，然后等待完成。

---

### 第 3 步：设置 API Key (30秒)

```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api
wrangler secret put HEYGEN_API_KEY
```

输入你的 HeyGen API Key：
```
sk_V2_hgu_kM6HDevMmxh_VpduEZGAyRQOYM2lD8MzRH8mFKPbkm2T
```

---

## ✅ 完成！

部署完成后，你会看到两个 URL：

1. **Worker API**: `https://songbrocade-api.petterbrand03.workers.dev`
2. **Frontend**: `https://xxxxx.poap-checkin-frontend.pages.dev`

访问 Frontend URL 即可查看你的网站！

---

## 🔍 测试部署

### 测试 API
```bash
curl https://songbrocade-api.petterbrand03.workers.dev/health
```

应该返回：
```json
{"status":"ok","timestamp":"..."}
```

### 测试前端
在浏览器打开 Frontend URL，检查：
- ✅ 首页视频正常播放
- ✅ 导航正常
- ✅ 商品列表正常

---

## ❓ 遇到问题？

### 问题 1: 未登录
```bash
wrangler login
```

### 问题 2: 权限错误
```bash
wrangler logout
wrangler login
```

### 问题 3: 部署失败
检查网络连接，然后重新运行 `./deploy.sh`

### 问题 4: 视频无法播放
确保视频已上传到 R2：
```bash
cd worker-api
wrangler r2 object list poap-images --prefix=videos/
```

如果没有视频，运行部署脚本选择选项 `4` 上传视频。

---

## 📚 详细文档

如需更多信息，查看：
```bash
cat DEPLOYMENT_GUIDE.md
```

---

## 🎉 就这么简单！

整个部署过程只需 5-10 分钟。

**现在就开始吧！** 🚀

