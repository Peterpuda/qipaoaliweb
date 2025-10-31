/**
 * i18n 预加载器
 * 优化语言加载流程，避免中文闪现
 */

(function() {
  'use strict';

  // 1. 立即隐藏页面内容，避免闪现
  const style = document.createElement('style');
  style.id = 'i18n-loading-style';
  style.textContent = `
    body {
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    body.i18n-ready {
      opacity: 1;
    }
    .i18n-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #F9F6F0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      opacity: 1;
      transition: opacity 0.3s ease-in-out;
    }
    .i18n-loading-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }
    .i18n-loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #D5BDAF;
      border-top-color: #9E2A2B;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // 2. 添加加载指示器
  const overlay = document.createElement('div');
  overlay.className = 'i18n-loading-overlay';
  overlay.innerHTML = '<div class="i18n-loading-spinner"></div>';
  document.body.appendChild(overlay);

  // 3. 预加载语言包
  async function preloadLanguagePack() {
    try {
      // 获取用户首选语言
      const savedLocale = localStorage.getItem('preferred_language');
      const browserLocale = navigator.language.split('-')[0];
      const defaultLocale = 'en';
      
      const locale = savedLocale || browserLocale || defaultLocale;
      
      console.log('🌍 Preloading language pack:', locale);
      
      // 预加载语言包
      const response = await fetch(`/i18n/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${locale}.json`);
      }
      
      const messages = await response.json();
      
      // 缓存到 sessionStorage
      sessionStorage.setItem(`i18n_${locale}`, JSON.stringify(messages));
      sessionStorage.setItem('i18n_preloaded_locale', locale);
      
      console.log('✅ Language pack preloaded successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to preload language pack:', error);
      
      // 如果预加载失败，尝试加载英文作为回退
      try {
        const response = await fetch('/i18n/locales/en.json');
        const messages = await response.json();
        sessionStorage.setItem('i18n_en', JSON.stringify(messages));
        sessionStorage.setItem('i18n_preloaded_locale', 'en');
        return true;
      } catch (fallbackError) {
        console.error('❌ Failed to load fallback language:', fallbackError);
        return false;
      }
    }
  }

  // 4. 页面加载完成后初始化
  async function initializeI18n() {
    // 预加载语言包
    await preloadLanguagePack();
    
    // 等待 DOM 完全加载
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // 等待 i18n 引擎加载
    if (!window.i18n) {
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (window.i18n) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
        
        // 超时保护
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 5000);
      });
    }
    
    // 显示页面
    document.body.classList.add('i18n-ready');
    
    // 移除加载指示器
    setTimeout(() => {
      overlay.classList.add('hidden');
      setTimeout(() => {
        overlay.remove();
        document.getElementById('i18n-loading-style')?.remove();
      }, 300);
    }, 100);
    
    console.log('✅ i18n initialization complete');
  }

  // 5. 立即开始初始化
  initializeI18n();

  // 6. 导出到全局
  window.i18nLoader = {
    preloadLanguagePack,
    initializeI18n
  };
})();

