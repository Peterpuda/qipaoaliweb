// 匠人 AI 对话组件 - 卡片内嵌版本
// 用法：ArtisanChatInline.open(containerId, artisanId, artisanData)

const ArtisanChatInline = (() => {
  // Version 2.0 - Using real AI API /ai/artisan-agent/reply
  console.log('🎭 ArtisanChatInline v2.0 loaded');
  
  const API_BASE = typeof POAP_CONFIG !== 'undefined' 
    ? (POAP_CONFIG.API_BASE || POAP_CONFIG.WORKER_BASE_URL)
    : 'https://songbrocade-api.petterbrand03.workers.dev';

  let activeChats = {}; // 存储多个活跃的对话实例
  
  // 初始化卡片内对话框
  function initInlineChat(containerId, artisanId, artisanData) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // 如果已经存在，直接返回
    if (activeChats[containerId]) {
      return activeChats[containerId];
    }

    const chatId = `chat_${containerId}_${Date.now()}`;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const chatHTML = `
<div id="${chatId}" class="artisan-chat-inline" style="display: none;">
  <!-- 对话头部 -->
  <div class="chat-inline-header">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
        <i class="fas fa-robot text-lg"></i>
      </div>
      <div class="flex-1">
        <h4 class="font-bold text-ink text-sm" id="${chatId}_name">${artisanData.name_zh || '匠人 AI'}</h4>
        <p class="text-xs text-secondary">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
          <span data-i18n="artisan.chat.online">在线</span>
        </p>
      </div>
      <button onclick="ArtisanChatInline.close('${containerId}')" class="text-secondary hover:text-ink transition">
        <i class="fas fa-times text-lg"></i>
      </button>
    </div>
  </div>

  <!-- 欢迎消息 -->
  <div class="chat-inline-welcome" id="${chatId}_welcome">
    <div class="text-center py-6">
      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-3">
        <i class="fas fa-robot text-2xl"></i>
      </div>
      <p class="text-ink font-medium mb-2">
        <span data-i18n="artisan.chat.greeting">你好！我是</span> <span class="text-primary">${artisanData.name_zh || '匠人'}</span> <span data-i18n="artisan.chat.aiAssistant">的 AI 助手</span> 👋
      </p>
      <p class="text-sm text-secondary mb-4" data-i18n="artisan.chat.welcomeMessage">很高兴与你交流，有什么想了解的吗？</p>
      
      <!-- 快捷问题 -->
      <div class="grid grid-cols-2 gap-2 mt-4">
        <button class="quick-question-btn" onclick="ArtisanChatInline.sendQuickQuestion('${containerId}', '这件作品的创作灵感来自哪里？')">
          <i class="fas fa-lightbulb mr-1"></i>
          <span data-i18n="artisan.chat.question1">创作灵感</span>
        </button>
        <button class="quick-question-btn" onclick="ArtisanChatInline.sendQuickQuestion('${containerId}', '制作过程是怎样的？')">
          <i class="fas fa-tools mr-1"></i>
          <span data-i18n="artisan.chat.question2">制作过程</span>
        </button>
        <button class="quick-question-btn" onclick="ArtisanChatInline.sendQuickQuestion('${containerId}', '能讲讲背后的文化故事吗？')">
          <i class="fas fa-book mr-1"></i>
          <span data-i18n="artisan.chat.question3">文化故事</span>
        </button>
        <button class="quick-question-btn" onclick="ArtisanChatInline.sendQuickQuestion('${containerId}', '如何保养和使用？')">
          <i class="fas fa-heart mr-1"></i>
          <span data-i18n="artisan.chat.question4">保养使用</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 消息区域 -->
  <div class="chat-inline-messages" id="${chatId}_messages">
    <!-- 消息将动态插入这里 -->
  </div>

  <!-- 输入区域 -->
  <div class="chat-inline-input">
    <div class="flex items-end gap-2">
      <textarea 
        id="${chatId}_input" 
        class="chat-input-field"
        placeholder="输入你的问题..."
        data-i18n-placeholder="artisan.chat.inputPlaceholder"
        rows="1"
        onkeydown="ArtisanChatInline.handleKeydown(event, '${containerId}')"
      ></textarea>
      <button 
        id="${chatId}_send" 
        class="chat-send-btn"
        onclick="ArtisanChatInline.sendMessage('${containerId}')"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
    <div class="text-xs text-secondary mt-2 flex items-center justify-between">
      <span>
        <i class="fas fa-robot mr-1"></i>
        <span data-i18n="artisan.chat.aiPowered">由 AI 驱动，回答可能有误差</span>
      </span>
    </div>
  </div>
</div>
    `;

    container.insertAdjacentHTML('beforeend', chatHTML);
    loadInlineStyles();

    // 存储对话实例
    activeChats[containerId] = {
      chatId,
      sessionId,
      artisanId,
      artisanData,
      chatHistory: [],
      currentLang: 'zh'
    };

    return activeChats[containerId];
  }

  // 加载内嵌样式
  function loadInlineStyles() {
    if (document.getElementById('artisan-chat-inline-styles')) return;

    const styles = `
<style id="artisan-chat-inline-styles">
.artisan-chat-inline {
  background: var(--paper, #fff);
  border: 1px solid var(--line, #e0e0e0);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.chat-inline-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  color: white;
}

.chat-inline-welcome {
  padding: 16px;
  background: var(--paper, #fff);
  border-bottom: 1px solid var(--line, #e0e0e0);
}

.quick-question-btn {
  background: var(--paper, #fff);
  border: 1px solid var(--line, #e0e0e0);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--ink, #333);
  transition: all 0.3s;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
}

.quick-question-btn:hover {
  background: var(--accent, #f5f5f5);
  border-color: var(--primary, #9E2A2B);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chat-inline-messages {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: var(--paper, #fff);
  display: none; /* 初始隐藏，有消息时显示 */
}

.chat-inline-messages.has-messages {
  display: block;
}

.chat-message {
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message.user {
  text-align: right;
}

.chat-message.assistant {
  text-align: left;
}

.message-bubble {
  display: inline-block;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.chat-message.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-message.assistant .message-bubble {
  background: var(--accent, #f5f5f5);
  color: var(--ink, #333);
  border-bottom-left-radius: 4px;
}

.message-time {
  display: block;
  font-size: 11px;
  color: var(--secondary, #999);
  margin-top: 4px;
}

.chat-inline-input {
  padding: 16px;
  background: var(--paper, #fff);
  border-top: 1px solid var(--line, #e0e0e0);
}

.chat-input-field {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--line, #e0e0e0);
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  max-height: 100px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.chat-input-field:focus {
  outline: none;
  border-color: var(--primary, #9E2A2B);
}

.chat-send-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: var(--accent, #f5f5f5);
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  display: inline-block;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--secondary, #999);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .chat-inline-messages {
    max-height: 300px;
  }
  
  .message-bubble {
    max-width: 90%;
  }
}
</style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // 打开对话
  function open(containerId, artisanId, artisanData) {
    const chat = initInlineChat(containerId, artisanId, artisanData);
    if (!chat) return;

    const chatElement = document.getElementById(chat.chatId);
    if (chatElement) {
      chatElement.style.display = 'block';
      
      // 滚动到对话框
      setTimeout(() => {
        chatElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  // 关闭对话
  function close(containerId) {
    const chat = activeChats[containerId];
    if (!chat) return;

    const chatElement = document.getElementById(chat.chatId);
    if (chatElement) {
      chatElement.style.display = 'none';
    }
  }

  // 切换对话显示状态
  function toggle(containerId, artisanId, artisanData) {
    const chat = activeChats[containerId];
    if (!chat) {
      open(containerId, artisanId, artisanData);
      return;
    }

    const chatElement = document.getElementById(chat.chatId);
    if (chatElement) {
      if (chatElement.style.display === 'none') {
        chatElement.style.display = 'block';
        chatElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        chatElement.style.display = 'none';
      }
    }
  }

  // 发送快捷问题
  function sendQuickQuestion(containerId, question) {
    const chat = activeChats[containerId];
    if (!chat) return;

    // 隐藏欢迎消息
    const welcomeElement = document.getElementById(`${chat.chatId}_welcome`);
    if (welcomeElement) {
      welcomeElement.style.display = 'none';
    }

    // 显示消息区域
    const messagesElement = document.getElementById(`${chat.chatId}_messages`);
    if (messagesElement) {
      messagesElement.classList.add('has-messages');
    }

    // 添加用户消息
    addMessage(containerId, 'user', question);

    // 发送到 API
    sendToAPI(containerId, question);
  }

  // 发送消息
  function sendMessage(containerId) {
    const chat = activeChats[containerId];
    if (!chat) return;

    const inputElement = document.getElementById(`${chat.chatId}_input`);
    const message = inputElement.value.trim();

    if (!message) return;

    // 清空输入框
    inputElement.value = '';
    inputElement.style.height = 'auto';

    // 隐藏欢迎消息
    const welcomeElement = document.getElementById(`${chat.chatId}_welcome`);
    if (welcomeElement) {
      welcomeElement.style.display = 'none';
    }

    // 显示消息区域
    const messagesElement = document.getElementById(`${chat.chatId}_messages`);
    if (messagesElement) {
      messagesElement.classList.add('has-messages');
    }

    // 添加用户消息
    addMessage(containerId, 'user', message);

    // 发送到 API
    sendToAPI(containerId, message);
  }

  // 添加消息到界面
  function addMessage(containerId, role, content) {
    const chat = activeChats[containerId];
    if (!chat) return;

    const messagesElement = document.getElementById(`${chat.chatId}_messages`);
    if (!messagesElement) return;

    const messageHTML = `
<div class="chat-message ${role}">
  <div class="message-bubble">
    ${content}
  </div>
  <span class="message-time">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
</div>
    `;

    messagesElement.insertAdjacentHTML('beforeend', messageHTML);
    messagesElement.scrollTop = messagesElement.scrollHeight;

    // 添加到历史记录
    chat.chatHistory.push({ role, content });
  }

  // 显示输入中指示器
  function showTypingIndicator(containerId) {
    const chat = activeChats[containerId];
    if (!chat) return;

    const messagesElement = document.getElementById(`${chat.chatId}_messages`);
    if (!messagesElement) return;

    const typingHTML = `
<div class="chat-message assistant" id="${chat.chatId}_typing">
  <div class="typing-indicator">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>
</div>
    `;

    messagesElement.insertAdjacentHTML('beforeend', typingHTML);
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }

  // 移除输入中指示器
  function removeTypingIndicator(containerId) {
    const chat = activeChats[containerId];
    if (!chat) return;

    const typingElement = document.getElementById(`${chat.chatId}_typing`);
    if (typingElement) {
      typingElement.remove();
    }
  }

  // 发送到 API
  async function sendToAPI(containerId, userMessage) {
    const chat = activeChats[containerId];
    if (!chat) return;

    // ✅ 验证 artisan_id
    if (!chat.artisanId || chat.artisanId === 'undefined' || chat.artisanId === 'null') {
      console.error('❌ Invalid artisan_id:', chat.artisanId);
      removeTypingIndicator(containerId);
      addMessage(containerId, 'system', '匠人 ID 无效，无法发送消息');
      return;
    }
    
    console.log(`💬 Sending message to artisan: ${chat.artisanId}`);
    
    showTypingIndicator(containerId);

    try {
      // ✅ 使用真实的 AI 对话 API（而不是模拟 API）
      const response = await fetch(`${API_BASE}/ai/artisan-agent/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artisan_id: chat.artisanId,
          question: userMessage,  // 修改参数名：message → question
          session_id: chat.sessionId,
          lang: chat.currentLang,  // 修改参数名：language → lang
          user_id: null  // 可选：添加用户 ID
        })
      });

      removeTypingIndicator(containerId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // ✅ 适配真实 AI API 的响应格式
      if (data.ok && data.answer) {
        // 真实 AI API 返回 answer 字段
        addMessage(containerId, 'assistant', data.answer);
        console.log(`💬 Received AI response, model: ${data.model || 'unknown'}, tokens: ${data.tokens_used || 0}`);
      } else if (data.reply) {
        // 兼容旧的模拟 API 格式
        addMessage(containerId, 'assistant', data.reply);
      } else {
        console.error('❌ Invalid AI response:', data);
        addMessage(containerId, 'assistant', '抱歉，我现在无法回答。请稍后再试。');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      removeTypingIndicator(containerId);
      addMessage(containerId, 'assistant', '抱歉，连接出现问题。请检查网络后重试。');
    }
  }

  // 处理键盘事件
  function handleKeydown(event, containerId) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(containerId);
    }
  }

  // 公开 API
  return {
    open,
    close,
    toggle,
    sendMessage,
    sendQuickQuestion,
    handleKeydown
  };
})();

// 全局暴露
window.ArtisanChatInline = ArtisanChatInline;

