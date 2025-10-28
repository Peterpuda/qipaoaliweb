// 匠人 AI 对话组件
// 用法：ArtisanChat.open(artisanId, artisanData)

const ArtisanChat = (() => {
  const API_BASE = typeof POAP_CONFIG !== 'undefined' 
    ? POAP_CONFIG.API_BASE 
    : 'https://songbrocade-api.petterbrand03.workers.dev';

  let currentArtisanId = null;
  let currentArtisan = null;
  let currentLang = 'zh';
  let chatHistory = [];
  let sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // 初始化对话模态框HTML
  function initModal() {
    if (document.getElementById('aiChatModal')) return;

    const modalHTML = `
<div id="aiChatModal" class="ai-chat-modal">
  <div class="modal-overlay" onclick="ArtisanChat.close()"></div>
  
  <div class="chat-container">
    <!-- 顶部栏 -->
    <div class="chat-header">
      <div class="artisan-presence">
        <div class="avatar-wrapper">
          <img id="chatAvatar" src="" class="chat-avatar" />
          <span class="online-indicator"></span>
        </div>
        <div class="artisan-meta">
          <h3 id="chatArtisanName" class="artisan-name"></h3>
          <p class="status">
            <span class="status-dot"></span>
            <span id="chatStatus">AI 智能体在线</span>
          </p>
        </div>
      </div>
      
      <button class="btn-close" onclick="ArtisanChat.close()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    
    <!-- 欢迎语 -->
    <div class="welcome-message" id="welcomeMessage">
      <div class="welcome-avatar">
        <img id="welcomeAvatar" src="" />
      </div>
      <div class="welcome-bubble">
        <p class="greeting">你好！我是 <span id="welcomeName"></span> 👋</p>
        <p class="intro" id="welcomeIntro">很高兴与你交流。</p>
        <p class="cta">有什么想了解的吗？随时问我！</p>
      </div>
    </div>
    
    <!-- 消息区域 -->
    <div class="chat-messages" id="chatMessages">
      <!-- 消息将动态插入这里 -->
    </div>
    
    <!-- 输入区域 -->
    <div class="chat-input-area">
      <!-- 快捷问题按钮 -->
      <div class="quick-questions" id="quickQuestions">
        <button class="quick-btn" onclick="ArtisanChat.sendQuickQuestion(this)">
          🎨 这件作品的创作灵感来自哪里？
        </button>
        <button class="quick-btn" onclick="ArtisanChat.sendQuickQuestion(this)">
          🛠️ 制作过程是怎样的？
        </button>
        <button class="quick-btn" onclick="ArtisanChat.sendQuickQuestion(this)">
          📖 能讲讲背后的文化故事吗？
        </button>
        <button class="quick-btn" onclick="ArtisanChat.sendQuickQuestion(this)">
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
          onkeydown="ArtisanChat.handleInputKeydown(event)"
        ></textarea>
        
        <button class="btn-send" id="btnSend" onclick="ArtisanChat.sendMessage()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
        </button>
      </div>
      
      <!-- 底部提示 -->
      <div class="input-hint">
        <span class="hint-icon">✨</span>
        <span>由 AI 驱动，回答可能有误差</span>
        <span class="lang-switch" onclick="ArtisanChat.switchLanguage()">
          🌐 切换到 English
        </span>
      </div>
    </div>
  </div>
</div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    loadStyles();
  }

  // 加载样式
  function loadStyles() {
    const styleId = 'artisan-chat-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
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
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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

.artisan-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
  margin: 4px 0 0 0;
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

.btn-close {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-close:hover {
  background: rgba(255,255,255,0.3);
}

.welcome-message {
  display: flex;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(to bottom, #f8f9fa 0%, white 100%);
  border-bottom: 1px solid #e5e7eb;
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
  from { transform: scale(0.9) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.welcome-bubble .greeting {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.welcome-bubble .intro {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 8px 0;
}

.welcome-bubble .cta {
  font-size: 13px;
  color: #9E2A2B;
  font-weight: 500;
  margin: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: messageSlideIn 0.3s ease;
}

@keyframes messageSlideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
  flex-shrink: 0;
  position: relative;
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
  margin: 0;
}

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

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-8px); opacity: 1; }
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
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
  font-family: inherit;
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

.btn-send:hover:not(:disabled) {
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
    `;
    document.head.appendChild(style);
  }

  // 打开对话框
  function open(artisanId, artisanData = null) {
    initModal();
    currentArtisanId = artisanId;
    currentArtisan = artisanData;
    
    const modal = document.getElementById('aiChatModal');
    modal.classList.add('active');
    
    // 更新UI
    if (artisanData) {
      const artisanName = currentLang === 'zh' ? artisanData.name_zh : artisanData.name_en;
      document.getElementById('chatAvatar').src = artisanData.avatar || '/image/hero.png';
      document.getElementById('welcomeAvatar').src = artisanData.avatar || '/image/hero.png';
      document.getElementById('chatArtisanName').textContent = artisanName;
      document.getElementById('welcomeName').textContent = artisanName;
      document.getElementById('welcomeIntro').textContent = artisanData.self_intro || '很高兴与你交流。';
    } else {
      // 异步加载匠人信息
      loadArtisanInfo(artisanId);
    }
    
    // 重置状态
    chatHistory = [];
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('quickQuestions').style.display = 'grid';
    
    // 自动聚焦输入框
    setTimeout(() => {
      document.getElementById('userInput').focus();
    }, 400);
  }

  // 关闭对话框
  function close() {
    const modal = document.getElementById('aiChatModal');
    modal.classList.remove('active');
  }

  // 加载匠人信息
  async function loadArtisanInfo(artisanId) {
    try {
      const response = await fetch(`${API_BASE}/api/artisans/${artisanId}`);
      const data = await response.json();
      
      if (data.ok) {
        currentArtisan = data.artisan;
        const artisanName = currentLang === 'zh' ? data.artisan.name_zh : data.artisan.name_en;
        document.getElementById('chatAvatar').src = data.artisan.avatar || '/image/hero.png';
        document.getElementById('welcomeAvatar').src = data.artisan.avatar || '/image/hero.png';
        document.getElementById('chatArtisanName').textContent = artisanName;
        document.getElementById('welcomeName').textContent = artisanName;
        document.getElementById('welcomeIntro').textContent = data.artisan.self_intro || '很高兴与你交流。';
      }
    } catch (error) {
      console.error('Load artisan failed:', error);
    }
  }

  // 发送快捷问题
  function sendQuickQuestion(btn) {
    const question = btn.textContent.replace(/^[🎨🛠️📖💡]\s+/, '');
    document.getElementById('quickQuestions').style.display = 'none';
    sendMessage(question);
  }

  // 发送消息
  async function sendMessage(predefinedQuestion = null) {
    const input = document.getElementById('userInput');
    const question = predefinedQuestion || input.value.trim();
    
    if (!question) return;
    
    input.value = '';
    addUserMessage(question);
    
    const loadingId = addAILoadingMessage();
    const sendBtn = document.getElementById('btnSend');
    sendBtn.disabled = true;
    
    try {
      const response = await fetch(`${API_BASE}/ai/artisan-agent/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artisan_id: currentArtisanId,
          question: question,
          lang: currentLang,
          session_id: sessionId
        })
      });
      
      const data = await response.json();
      
      removeLoadingMessage(loadingId);
      
      if (data.ok) {
        await addAIMessageWithTyping(data.answer, data.log_id);
        
        chatHistory.push({ role: 'user', content: question, timestamp: Date.now() });
        chatHistory.push({ role: 'assistant', content: data.answer, timestamp: Date.now(), log_id: data.log_id });
      } else {
        addAIMessage('抱歉，我现在无法回答这个问题。请稍后再试。', null, true);
      }
    } catch (error) {
      console.error('Send message failed:', error);
      removeLoadingMessage(loadingId);
      addAIMessage('网络错误，请检查连接后重试。', null, true);
    } finally {
      sendBtn.disabled = false;
    }
  }

  // 添加用户消息
  function addUserMessage(text) {
    const container = document.getElementById('chatMessages');
    const time = formatTime(new Date());
    
    const div = document.createElement('div');
    div.className = 'message user-message';
    div.innerHTML = `
      <div class="message-content">
        <p class="message-text">${escapeHtml(text)}</p>
      </div>
      <div class="message-time">${time}</div>
    `;
    
    container.appendChild(div);
    scrollToBottom();
  }

  // 添加 AI 加载动画
  function addAILoadingMessage() {
    const container = document.getElementById('chatMessages');
    const loadingId = `loading-${Date.now()}`;
    
    const div = document.createElement('div');
    div.className = 'message ai-message';
    div.id = loadingId;
    div.innerHTML = `
      <div class="avatar-small">
        <img src="${currentArtisan?.avatar || '/image/hero.png'}" />
      </div>
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    container.appendChild(div);
    scrollToBottom();
    
    return loadingId;
  }

  // 移除加载动画
  function removeLoadingMessage(loadingId) {
    const el = document.getElementById(loadingId);
    if (el) el.remove();
  }

  // 添加 AI 消息（带打字机效果）
  async function addAIMessageWithTyping(text, logId) {
    const container = document.getElementById('chatMessages');
    const time = formatTime(new Date());
    const artisanName = currentLang === 'zh' ? (currentArtisan?.name_zh || '匠人') : (currentArtisan?.name_en || 'Artisan');
    
    const div = document.createElement('div');
    div.className = 'message ai-message';
    div.innerHTML = `
      <div class="avatar-small">
        <img src="${currentArtisan?.avatar || '/image/hero.png'}" />
        <span class="ai-badge-mini">AI</span>
      </div>
      <div class="message-content">
        <div class="artisan-name-tag">${artisanName}</div>
        <p class="message-text"></p>
        <div class="message-actions">
          <button class="action-btn" onclick="ArtisanChat.likeMessage('${logId}', this)">
            👍 有帮助
          </button>
          <button class="action-btn" onclick="ArtisanChat.copyMessage(this)">
            📋 复制
          </button>
        </div>
      </div>
      <div class="message-time">${time}</div>
    `;
    
    container.appendChild(div);
    
    const textEl = div.querySelector('.message-text');
    await typeWriter(textEl, text, 30);
    scrollToBottom();
  }

  // 添加普通 AI 消息（无打字机效果，用于错误）
  function addAIMessage(text, logId, isError = false) {
    const container = document.getElementById('chatMessages');
    const time = formatTime(new Date());
    const artisanName = currentLang === 'zh' ? (currentArtisan?.name_zh || '匠人') : (currentArtisan?.name_en || 'Artisan');
    
    const div = document.createElement('div');
    div.className = 'message ai-message';
    div.innerHTML = `
      <div class="avatar-small">
        <img src="${currentArtisan?.avatar || '/image/hero.png'}" />
        <span class="ai-badge-mini">AI</span>
      </div>
      <div class="message-content">
        <div class="artisan-name-tag">${artisanName}</div>
        <p class="message-text">${escapeHtml(text)}</p>
      </div>
      <div class="message-time">${time}</div>
    `;
    
    container.appendChild(div);
    scrollToBottom();
  }

  // 打字机效果
  async function typeWriter(element, text, speed) {
    let index = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
          scrollToBottom();
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  // 点赞消息
  async function likeMessage(logId, btn) {
    try {
      await fetch(`${API_BASE}/ai/artisan-agent/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, feedback: 'helpful' })
      });
      
      btn.innerHTML = '✅ 已反馈';
      btn.style.color = '#10b981';
      btn.disabled = true;
    } catch (error) {
      console.error('Feedback failed:', error);
    }
  }

  // 复制消息
  function copyMessage(btn) {
    const text = btn.closest('.message-content').querySelector('.message-text').textContent;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✅ 已复制';
    btn.style.color = '#10b981';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.color = '';
    }, 2000);
  }

  // 切换语言
  function switchLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    const langSwitch = document.querySelector('.lang-switch');
    langSwitch.textContent = currentLang === 'zh' ? '🌐 Switch to English' : '🌐 切换到中文';
    
    // 更新欢迎语
    if (currentArtisan) {
      const artisanName = currentLang === 'zh' ? currentArtisan.name_zh : currentArtisan.name_en;
      document.getElementById('chatArtisanName').textContent = artisanName;
      document.getElementById('welcomeName').textContent = artisanName;
    }
    
    // 提示用户
    addSystemMessage(currentLang === 'zh' ? '已切换到中文模式' : 'Switched to English mode');
  }

  // 添加系统消息
  function addSystemMessage(text) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.style.cssText = 'text-align: center; padding: 8px; font-size: 12px; color: #9ca3af;';
    div.textContent = text;
    container.appendChild(div);
    scrollToBottom();
  }

  // 处理输入框按键
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

  // 工具函数
  function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    container.scrollTop = container.scrollHeight;
  }

  function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

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

  // 导出公共API
  return {
    open,
    close,
    sendQuickQuestion,
    sendMessage,
    likeMessage,
    copyMessage,
    switchLanguage,
    handleInputKeydown
  };
})();

