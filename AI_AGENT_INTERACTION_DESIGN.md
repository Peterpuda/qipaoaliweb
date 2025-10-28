# 🤖 AI 匠人智能体 - 详细交互设计文档

## 一、用户场景与交互流程

### 场景 1：用户浏览商品时遇到匠人智能体

```
用户路径：
首页 → 商品列表 → 商品详情页 → 看到匠人介绍 → 点击"与匠人对话" → 进入 AI 对话界面
```

### 场景 2：用户直接访问匠人页面

```
用户路径：
首页 → 匠人列表 → 匠人详情页 → AI 对话区域（页面下方）→ 开始对话
```

---

## 二、UI/UX 设计详解

### 2.1 匠人智能体入口设计

**位置 1：商品详情页**

```html
<!-- 商品详情页中的匠人卡片 -->
<div class="artisan-card">
  <div class="artisan-header">
    <img src="{{artisan.avatar}}" class="artisan-avatar" />
    <div class="artisan-info">
      <h3 class="artisan-name">{{artisan.name_zh}}</h3>
      <p class="artisan-title">非遗传承人 · {{artisan.region}}</p>
      
      <!-- AI 智能体标识 -->
      <div class="ai-badge">
        <span class="badge-glow">✨</span>
        <span>AI 智能体在线</span>
      </div>
    </div>
  </div>
  
  <!-- 快速提问入口 -->
  <div class="quick-ask">
    <p class="intro">想了解更多关于这件作品的故事？</p>
    <button class="btn-chat" onclick="openArtisanChat('{{artisan.id}}')">
      <i class="icon-chat"></i>
      与 {{artisan.name_zh}} 对话
    </button>
  </div>
  
  <!-- 推荐问题（提升用户参与度） -->
  <div class="suggested-questions">
    <p class="label">💬 大家都在问：</p>
    <button class="question-tag" onclick="askQuestion(this.textContent)">
      这件作品的制作工艺是什么？
    </button>
    <button class="question-tag" onclick="askQuestion(this.textContent)">
      需要多长时间完成？
    </button>
    <button class="question-tag" onclick="askQuestion(this.textContent)">
      如何保养和使用？
    </button>
  </div>
</div>

<style>
.artisan-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  padding: 24px;
  margin: 24px 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.artisan-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #D4AF37;
  box-shadow: 0 4px 12px rgba(212,175,55,0.3);
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
  animation: pulse-glow 2s infinite;
}

.badge-glow {
  animation: sparkle 1.5s infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(102,126,234,0.5); }
  50% { box-shadow: 0 0 20px rgba(102,126,234,0.8); }
}

@keyframes sparkle {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.btn-chat {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #D4AF37 0%, #9E2A2B 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-chat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,175,55,0.4);
}

.suggested-questions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.question-tag {
  display: inline-block;
  margin: 4px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #D4AF37;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.question-tag:hover {
  background: #D4AF37;
  color: white;
  transform: translateY(-1px);
}
</style>
```

---

### 2.2 对话界面设计（模态框 / 侧边栏）

**方案 A：全屏模态框（移动端友好）**

```html
<!-- AI 对话模态框 -->
<div id="aiChatModal" class="ai-chat-modal">
  <div class="modal-overlay" onclick="closeArtisanChat()"></div>
  
  <div class="chat-container">
    <!-- 顶部栏 -->
    <div class="chat-header">
      <div class="artisan-presence">
        <div class="avatar-wrapper">
          <img src="{{artisan.avatar}}" class="chat-avatar" />
          <span class="online-indicator"></span>
        </div>
        <div class="artisan-meta">
          <h3 class="artisan-name">{{artisan.name_zh}}</h3>
          <p class="status">
            <span class="status-dot"></span>
            AI 智能体在线
          </p>
        </div>
      </div>
      
      <button class="btn-close" onclick="closeArtisanChat()">
        <i class="icon-close"></i>
      </button>
    </div>
    
    <!-- 欢迎语 -->
    <div class="welcome-message">
      <div class="welcome-avatar">
        <img src="{{artisan.avatar}}" />
      </div>
      <div class="welcome-bubble">
        <p class="greeting">你好！我是 {{artisan.name_zh}} 👋</p>
        <p class="intro">
          {{artisan.self_intro_zh || '我是一名专注传统技艺的匠人，很高兴与你交流。'}}
        </p>
        <p class="cta">有什么想了解的吗？随时问我！</p>
      </div>
    </div>
    
    <!-- 消息区域 -->
    <div class="chat-messages" id="chatMessages">
      <!-- 消息将动态插入这里 -->
    </div>
    
    <!-- 输入区域 -->
    <div class="chat-input-area">
      <!-- 快捷问题按钮（初次显示） -->
      <div class="quick-questions" id="quickQuestions">
        <button class="quick-btn" onclick="sendQuickQuestion(this)">
          🎨 这件作品的创作灵感来自哪里？
        </button>
        <button class="quick-btn" onclick="sendQuickQuestion(this)">
          🛠️ 制作过程是怎样的？
        </button>
        <button class="quick-btn" onclick="sendQuickQuestion(this)">
          📖 能讲讲背后的文化故事吗？
        </button>
        <button class="quick-btn" onclick="sendQuickQuestion(this)">
          💡 如何保养和使用？
        </button>
      </div>
      
      <!-- 输入框 -->
      <div class="input-wrapper">
        <textarea 
          id="userInput" 
          class="chat-input"
          placeholder="输入你的问题..."
          rows="1"
          onkeydown="handleInputKeydown(event)"
        ></textarea>
        
        <button class="btn-send" id="btnSend" onclick="sendMessage()">
          <i class="icon-send"></i>
        </button>
      </div>
      
      <!-- 底部提示 -->
      <div class="input-hint">
        <span class="hint-icon">✨</span>
        <span>由 AI 驱动，回答可能有误差</span>
        <span class="lang-switch" onclick="switchLanguage()">
          🌐 切换到 English
        </span>
      </div>
    </div>
  </div>
</div>

<style>
.ai-chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: none;
  animation: fadeIn 0.3s ease;
}

.ai-chat-modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.chat-container {
  position: relative;
  width: 90%;
  max-width: 600px;
  height: 80vh;
  max-height: 800px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(100px); 
    opacity: 0;
  }
  to { 
    transform: translateY(0); 
    opacity: 1;
  }
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.artisan-presence {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid white;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); box-shadow: 0 0 8px #10b981; }
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.welcome-message {
  display: flex;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(to bottom, #f8f9fa 0%, white 100%);
  border-bottom: 1px solid #e5e7eb;
}

.welcome-avatar {
  flex-shrink: 0;
}

.welcome-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #D4AF37;
}

.welcome-bubble {
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  animation: bubbleIn 0.5s ease;
}

@keyframes bubbleIn {
  from { 
    transform: scale(0.9) translateY(10px); 
    opacity: 0;
  }
  to { 
    transform: scale(1) translateY(0); 
    opacity: 1;
  }
}

.welcome-bubble .greeting {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.welcome-bubble .intro {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 8px;
}

.welcome-bubble .cta {
  font-size: 13px;
  color: #9E2A2B;
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.chat-input-area {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: #f9fafb;
}

.quick-questions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
  animation: slideInUp 0.4s ease;
}

@keyframes slideInUp {
  from { 
    transform: translateY(20px); 
    opacity: 0;
  }
  to { 
    transform: translateY(0); 
    opacity: 1;
  }
}

.quick-btn {
  padding: 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #D4AF37;
  color: white;
  border-color: #D4AF37;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212,175,55,0.3);
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 8px;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  resize: none;
  max-height: 120px;
  transition: border-color 0.2s;
}

.chat-input:focus {
  outline: none;
  border-color: #D4AF37;
}

.btn-send {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #D4AF37 0%, #9E2A2B 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-send:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(212,175,55,0.4);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #9ca3af;
}

.lang-switch {
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
}

.lang-switch:hover {
  text-decoration: underline;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .chat-container {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .quick-questions {
    grid-template-columns: 1fr;
  }
}
</style>
```

---

### 2.3 消息气泡设计

```html
<!-- 用户消息 -->
<div class="message user-message">
  <div class="message-content">
    <p>这件作品的制作工艺是什么？</p>
  </div>
  <div class="message-time">15:23</div>
</div>

<!-- AI 消息（加载中） -->
<div class="message ai-message typing">
  <div class="avatar-small">
    <img src="{{artisan.avatar}}" />
  </div>
  <div class="message-content">
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</div>

<!-- AI 消息（完整） -->
<div class="message ai-message">
  <div class="avatar-small">
    <img src="{{artisan.avatar}}" />
    <span class="ai-badge-mini">AI</span>
  </div>
  <div class="message-content">
    <div class="artisan-name-tag">{{artisan.name_zh}}</div>
    <p class="message-text">
      这件作品采用的是传统的手工刺绣技艺。整个制作过程需要经过选料、
      绘图、配线、刺绣等多个步骤，每一针每一线都凝聚着匠人的心血...
    </p>
    
    <!-- 相关操作 -->
    <div class="message-actions">
      <button class="action-btn" onclick="likeMessage(this)">
        <i class="icon-thumb-up"></i> 有帮助
      </button>
      <button class="action-btn" onclick="copyMessage(this)">
        <i class="icon-copy"></i> 复制
      </button>
      <button class="action-btn" onclick="translateMessage(this)">
        <i class="icon-translate"></i> 翻译
      </button>
    </div>
  </div>
  <div class="message-time">15:24</div>
</div>

<style>
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: messageSlideIn 0.3s ease;
}

@keyframes messageSlideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  background: linear-gradient(135deg, #D4AF37 0%, #9E2A2B 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  max-width: 70%;
}

.ai-message .message-content {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
  max-width: 75%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.avatar-small {
  position: relative;
  flex-shrink: 0;
}

.avatar-small img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #D4AF37;
}

.ai-badge-mini {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 8px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 6px;
  border: 1px solid white;
}

.artisan-name-tag {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 6px;
}

.message-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 打字机效果 */
.message-text.typing-effect {
  animation: cursorBlink 0.8s infinite;
}

@keyframes cursorBlink {
  0%, 100% { border-right: 2px solid #374151; }
  50% { border-right: 2px solid transparent; }
}

/* 加载动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typingDot 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  border-color: #D4AF37;
  color: #D4AF37;
}

.message-time {
  font-size: 10px;
  color: #9ca3af;
  align-self: flex-end;
  margin-bottom: 4px;
}
</style>
```

---

## 三、交互流程详细说明

### 3.1 完整对话流程

```javascript
// 全局变量
let currentArtisanId = null;
let currentLang = 'zh';
let chatHistory = [];

// 1. 打开对话框
function openArtisanChat(artisanId) {
  currentArtisanId = artisanId;
  const modal = document.getElementById('aiChatModal');
  modal.classList.add('active');
  
  // 加载匠人信息
  loadArtisanInfo(artisanId);
  
  // 初始化聊天历史
  chatHistory = [];
  
  // 自动聚焦输入框
  setTimeout(() => {
    document.getElementById('userInput').focus();
  }, 400);
}

// 2. 加载匠人信息
async function loadArtisanInfo(artisanId) {
  const response = await fetch(`${API_BASE}/api/artisans/${artisanId}`);
  const data = await response.json();
  
  if (data.ok) {
    // 更新欢迎语
    updateWelcomeMessage(data.artisan);
  }
}

// 3. 发送快捷问题
function sendQuickQuestion(btn) {
  const question = btn.textContent.replace(/^[🎨🛠️📖💡]\s+/, '');
  
  // 隐藏快捷问题区域
  document.getElementById('quickQuestions').style.display = 'none';
  
  // 发送问题
  sendMessage(question);
}

// 4. 发送消息（核心函数）
async function sendMessage(predefinedQuestion = null) {
  const input = document.getElementById('userInput');
  const question = predefinedQuestion || input.value.trim();
  
  if (!question) return;
  
  // 清空输入框
  input.value = '';
  
  // 添加用户消息到界面
  addUserMessage(question);
  
  // 添加 AI 加载动画
  const loadingId = addAILoadingMessage();
  
  // 禁用发送按钮
  const sendBtn = document.getElementById('btnSend');
  sendBtn.disabled = true;
  
  try {
    // 调用后端 API
    const response = await fetch(`${API_BASE}/ai/artisan-agent/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        artisan_id: currentArtisanId,
        question: question,
        lang: currentLang
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      // 移除加载动画
      removeLoadingMessage(loadingId);
      
      // 添加 AI 回复（带打字机效果）
      await addAIMessageWithTyping(data.answer);
      
      // 添加到历史记录
      chatHistory.push({
        role: 'user',
        content: question,
        timestamp: Date.now()
      });
      chatHistory.push({
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now()
      });
      
    } else {
      removeLoadingMessage(loadingId);
      addAIMessage('抱歉，我现在无法回答这个问题。请稍后再试。', true);
    }
    
  } catch (error) {
    console.error('发送消息失败:', error);
    removeLoadingMessage(loadingId);
    addAIMessage('网络错误，请检查连接后重试。', true);
  } finally {
    // 重新启用发送按钮
    sendBtn.disabled = false;
  }
}

// 5. 添加用户消息到界面
function addUserMessage(text) {
  const messagesContainer = document.getElementById('chatMessages');
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user-message';
  messageDiv.innerHTML = `
    <div class="message-content">
      <p>${escapeHtml(text)}</p>
    </div>
    <div class="message-time">${time}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// 6. 添加 AI 加载动画
function addAILoadingMessage() {
  const messagesContainer = document.getElementById('chatMessages');
  const loadingId = `loading-${Date.now()}`;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message ai-message typing';
  messageDiv.id = loadingId;
  messageDiv.innerHTML = `
    <div class="avatar-small">
      <img src="${currentArtisan.avatar}" />
    </div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
  
  return loadingId;
}

// 7. 移除加载动画
function removeLoadingMessage(loadingId) {
  const loadingEl = document.getElementById(loadingId);
  if (loadingEl) {
    loadingEl.remove();
  }
}

// 8. 添加 AI 消息（带打字机效果）
async function addAIMessageWithTyping(text) {
  const messagesContainer = document.getElementById('chatMessages');
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message ai-message';
  messageDiv.innerHTML = `
    <div class="avatar-small">
      <img src="${currentArtisan.avatar}" />
      <span class="ai-badge-mini">AI</span>
    </div>
    <div class="message-content">
      <div class="artisan-name-tag">${currentArtisan.name_zh}</div>
      <p class="message-text typing-effect"></p>
      <div class="message-actions">
        <button class="action-btn" onclick="likeMessage(this)">
          <i class="icon-thumb-up"></i> 有帮助
        </button>
        <button class="action-btn" onclick="copyMessage(this)">
          <i class="icon-copy"></i> 复制
        </button>
      </div>
    </div>
    <div class="message-time">${time}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  
  // 打字机效果
  const textElement = messageDiv.querySelector('.message-text');
  await typeWriter(textElement, text, 30); // 30ms 每个字符
  
  scrollToBottom();
}

// 9. 打字机效果实现
async function typeWriter(element, text, speed) {
  let index = 0;
  
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        scrollToBottom();
      } else {
        element.classList.remove('typing-effect');
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

// 10. 滚动到底部
function scrollToBottom() {
  const messagesContainer = document.getElementById('chatMessages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 11. 输入框自动调整高度
function handleInputKeydown(event) {
  const input = event.target;
  
  // Enter 发送，Shift+Enter 换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
  
  // 自动调整高度
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

// 12. 语言切换
function switchLanguage() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  const langSwitch = document.querySelector('.lang-switch');
  langSwitch.textContent = currentLang === 'zh' ? '🌐 Switch to English' : '🌐 切换到中文';
  
  // 提示用户
  addSystemMessage(
    currentLang === 'zh' 
      ? '已切换到中文模式' 
      : 'Switched to English mode'
  );
}

// 13. 消息操作
function likeMessage(btn) {
  btn.innerHTML = '<i class="icon-thumb-up-filled"></i> 已反馈';
  btn.style.color = '#10b981';
  btn.disabled = true;
  
  // TODO: 发送反馈到后端
  console.log('用户觉得这条回答有帮助');
}

function copyMessage(btn) {
  const messageText = btn.closest('.message-content').querySelector('.message-text').textContent;
  navigator.clipboard.writeText(messageText);
  
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<i class="icon-check"></i> 已复制';
  btn.style.color = '#10b981';
  
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.color = '';
  }, 2000);
}

// 14. 工具函数
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

---

## 四、特殊交互效果

### 4.1 语音输入（可选功能）

```html
<button class="btn-voice" onclick="startVoiceInput()">
  <i class="icon-microphone"></i>
</button>

<script>
let recognition = null;

function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('您的浏览器不支持语音输入');
    return;
  }
  
  if (!recognition) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = currentLang === 'zh' ? 'zh-CN' : 'en-US';
    recognition.continuous = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('userInput').value = transcript;
    };
  }
  
  recognition.start();
  // 显示语音输入动画
  showVoiceAnimation();
}
</script>
```

### 4.2 图片识别（高级功能）

```html
<button class="btn-image" onclick="uploadImage()">
  <i class="icon-image"></i>
</button>

<script>
async function uploadImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 显示上传的图片
    addImageMessage(file);
    
    // 上传到服务器并请求 AI 分析
    const formData = new FormData();
    formData.append('image', file);
    formData.append('artisan_id', currentArtisanId);
    
    const response = await fetch(`${API_BASE}/ai/artisan-agent/analyze-image`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.ok) {
      addAIMessageWithTyping(data.analysis);
    }
  };
  
  input.click();
}
</script>
```

---

## 五、性能优化

### 5.1 消息历史分页加载

```javascript
let messageOffset = 0;
const MESSAGE_LIMIT = 20;

async function loadMoreMessages() {
  const response = await fetch(
    `${API_BASE}/ai/artisan-agent/history/${currentArtisanId}?offset=${messageOffset}&limit=${MESSAGE_LIMIT}`
  );
  
  const data = await response.json();
  if (data.ok && data.messages.length > 0) {
    prependMessages(data.messages);
    messageOffset += MESSAGE_LIMIT;
  }
}

// 滚动到顶部时自动加载
document.getElementById('chatMessages').addEventListener('scroll', (e) => {
  if (e.target.scrollTop === 0) {
    loadMoreMessages();
  }
});
```

### 5.2 防抖处理

```javascript
let sendTimeout = null;

function sendMessageDebounced() {
  clearTimeout(sendTimeout);
  sendTimeout = setTimeout(() => {
    sendMessage();
  }, 300);
}
```

---

## 六、移动端体验优化

```css
/* 移动端全屏体验 */
@media (max-width: 640px) {
  .chat-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  /* 键盘弹出时调整 */
  .chat-input-area {
    position: sticky;
    bottom: 0;
  }
  
  /* 优化触控体验 */
  .btn-send {
    width: 56px;
    height: 56px;
  }
  
  .quick-btn {
    min-height: 48px;
  }
}

/* iOS 安全区域适配 */
.chat-container {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 七、可访问性（A11y）

```html
<!-- ARIA 标签 -->
<div 
  role="dialog" 
  aria-labelledby="chat-title" 
  aria-describedby="chat-description"
  class="ai-chat-modal"
>
  <h2 id="chat-title" class="sr-only">与匠人对话</h2>
  <p id="chat-description" class="sr-only">
    这是一个 AI 驱动的智能体，可以回答关于匠人和作品的问题
  </p>
  
  <!-- 可聚焦元素 -->
  <button aria-label="关闭对话" onclick="closeArtisanChat()">
    <i class="icon-close"></i>
  </button>
</div>

<!-- 屏幕阅读器支持 -->
<div role="log" aria-live="polite" aria-relevant="additions">
  <!-- 消息会自动朗读给视障用户 -->
</div>
```

---

## 八、总结

这个 AI 智能体交互设计的核心特点：

1. **🎨 视觉吸引力**：渐变背景、动画效果、专业配色
2. **⚡ 流畅体验**：打字机效果、加载动画、平滑滚动
3. **🎯 易用性**：快捷问题、语言切换、一键操作
4. **📱 响应式**：移动端适配、全屏体验
5. **♿ 可访问性**：ARIA 标签、键盘导航
6. **🔧 可扩展**：支持语音、图片、多语言

下一步我们可以开始实施 Sprint 1（数据库）和 Sprint 2（配置界面），你觉得如何？

