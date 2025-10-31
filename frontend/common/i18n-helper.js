/**
 * i18n 辅助函数
 * 提供页面翻译、语言切换器等实用功能
 */

/**
 * 翻译页面上的所有元素
 */
function translatePage() {
  // 翻译所有带 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const params = el.getAttribute('data-i18n-params');
    
    try {
      const parsedParams = params ? JSON.parse(params) : {};
      el.textContent = t(key, parsedParams);
    } catch (error) {
      console.error(`Error translating element with key: ${key}`, error);
      el.textContent = t(key);
    }
  });

  // 翻译所有带 data-i18n-html 属性的元素（支持 HTML）
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const params = el.getAttribute('data-i18n-params');
    
    try {
      const parsedParams = params ? JSON.parse(params) : {};
      el.innerHTML = t(key, parsedParams);
    } catch (error) {
      console.error(`Error translating HTML element with key: ${key}`, error);
      el.innerHTML = t(key);
    }
  });

  // 翻译所有带 data-i18n-placeholder 属性的元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // 翻译所有带 data-i18n-title 属性的元素
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });

  // 翻译所有带 data-i18n-value 属性的元素
  document.querySelectorAll('[data-i18n-value]').forEach(el => {
    const key = el.getAttribute('data-i18n-value');
    el.value = t(key);
  });

  // 翻译所有带 data-i18n-aria-label 属性的元素
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    el.setAttribute('aria-label', t(key));
  });

  console.log('✅ Page translated');
}

/**
 * 获取国旗 emoji
 * @param {string} locale - 语言代码
 * @returns {string} 国旗 emoji
 */
function getFlagEmoji(locale) {
  const flags = {
    zh: '🇨🇳',
    en: '🇺🇸',
    ja: '🇯🇵',
    fr: '🇫🇷',
    es: '🇪🇸',
    ru: '🇷🇺',
    ms: '🇲🇾'
  };
  return flags[locale] || '🌍';
}

/**
 * 创建语言切换器组件
 * @param {string} containerId - 容器元素 ID
 * @param {object} options - 配置选项
 */
function createLanguageSwitcher(containerId = 'languageSwitcher', options = {}) {
  const {
    showFlag = true,
    showText = true,
    position = 'top-right',
    style = 'dropdown' // 'dropdown' 或 'buttons'
  } = options || {};

  // 确保 window.i18n 已初始化
  if (!window.i18n) {
    console.error('window.i18n is not initialized');
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  // 确保i18n已初始化且有可用方法
  if (!window.i18n || typeof window.i18n.getAvailableLocales !== 'function') {
    console.error('window.i18n is not properly initialized');
    return;
  }

  const locales = window.i18n.getAvailableLocales();
  const currentLocale = window.i18n.getLocale();

  // 为每个容器生成唯一的ID，避免冲突
  const uniqueId = containerId.replace(/[^a-zA-Z0-9]/g, '_');
  const langBtnId = `langBtn_${uniqueId}`;
  const langDropdownId = `langDropdown_${uniqueId}`;

  if (style === 'dropdown') {
    // 下拉菜单样式
    container.innerHTML = `
      <div class="language-switcher-dropdown">
        <button class="lang-btn" id="${langBtnId}">
          ${showFlag ? getFlagEmoji(currentLocale) : ''}
          ${showText ? window.i18n.getLocaleName(currentLocale) : ''}
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="lang-dropdown" id="${langDropdownId}" style="display: none;">
          ${locales.map(locale => `
            <button class="lang-option ${locale === currentLocale ? 'active' : ''}" 
                    data-locale="${locale}">
              ${showFlag ? getFlagEmoji(locale) : ''} ${window.i18n.getLocaleName(locale)}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // 添加样式
    if (!document.getElementById('i18n-switcher-styles')) {
      const style = document.createElement('style');
      style.id = 'i18n-switcher-styles';
      style.textContent = `
        .language-switcher-dropdown {
          position: relative;
          display: inline-block;
        }
        .lang-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #ffffff;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        }
        .lang-btn:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: #D4AF37;
        }
        .lang-btn i {
          font-size: 12px;
          transition: transform 0.3s;
        }
        .lang-btn.active i {
          transform: rotate(180deg);
        }
        .lang-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: rgba(27, 27, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
          min-width: 180px;
          z-index: 1000;
          overflow: hidden;
          backdrop-filter: blur(20px);
        }
        .lang-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          font-size: 14px;
          color: #ffffff;
          text-align: left;
          transition: all 0.3s;
        }
        .lang-option:last-child {
          border-bottom: none;
        }
        .lang-option:hover {
          background: rgba(212, 175, 55, 0.15);
        }
        .lang-option.active {
          background: rgba(212, 175, 55, 0.25);
          color: #D4AF37;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
    }

    // 添加事件监听
    const langBtn = document.getElementById(langBtnId);
    const langDropdown = document.getElementById(langDropdownId);

    if (!langBtn || !langDropdown) {
      console.error(`Language switcher elements not found: ${langBtnId}, ${langDropdownId}`);
      return;
    }

    // 移除之前可能存在的监听器（如果有）
    const newLangBtn = langBtn.cloneNode(true);
    langBtn.parentNode.replaceChild(newLangBtn, langBtn);

    // 重新获取元素
    const btn = document.getElementById(langBtnId);
    const dropdown = document.getElementById(langDropdownId);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
      btn.classList.toggle('active', !isVisible);
    });

    // 点击外部关闭（使用事件委托，只绑定一次）
    if (!window._i18nOutsideClickHandler) {
      window._i18nOutsideClickHandler = (e) => {
        // 查找所有打开的下拉菜单并关闭它们
        document.querySelectorAll('.lang-dropdown').forEach(dd => {
          const container = dd.closest('.language-switcher-dropdown');
          if (container && !container.contains(e.target)) {
            dd.style.display = 'none';
            const btn = container.querySelector('.lang-btn');
            if (btn) btn.classList.remove('active');
          }
        });
      };
      document.addEventListener('click', window._i18nOutsideClickHandler, true);
    }

    // 语言选项点击
    dropdown.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const locale = option.getAttribute('data-locale');
        
        if (!locale) {
          console.error('Locale not found');
          return;
        }
        
        try {
          await window.i18n.setLocale(locale);
          
          // 更新按钮文本
          btn.innerHTML = `
            ${showFlag ? getFlagEmoji(locale) : ''}
            ${showText ? window.i18n.getLocaleName(locale) : ''}
            <i class="fas fa-chevron-down"></i>
          `;
          
          // 更新选中状态
          dropdown.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.remove('active');
          });
          option.classList.add('active');
          
          // 关闭下拉菜单
          dropdown.style.display = 'none';
          btn.classList.remove('active');
          
          // 重新翻译页面
          translatePage();
          
          console.log(`✅ Language switched to: ${locale}`);
        } catch (error) {
          console.error('Failed to switch language:', error);
        }
      });
    });
  } else {
    // 按钮组样式
    container.innerHTML = `
      <div class="language-switcher-buttons">
        ${locales.map(locale => `
          <button class="lang-button ${locale === currentLocale ? 'active' : ''}" 
                  data-locale="${locale}"
                  title="${window.i18n.getLocaleName(locale)}">
            ${showFlag ? getFlagEmoji(locale) : window.i18n.getLocaleName(locale)}
          </button>
        `).join('')}
      </div>
    `;

    // 添加样式
    if (!document.getElementById('i18n-buttons-styles')) {
      const style = document.createElement('style');
      style.id = 'i18n-buttons-styles';
      style.textContent = `
        .language-switcher-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .lang-button {
          padding: 6px 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: all 0.3s;
        }
        .lang-button:hover {
          background: #f5f5f5;
          border-color: #9E2A2B;
        }
        .lang-button.active {
          background: #9E2A2B;
          color: white;
          border-color: #9E2A2B;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
    }

    // 添加事件监听
    container.querySelectorAll('.lang-button').forEach(button => {
      button.addEventListener('click', async () => {
        const locale = button.getAttribute('data-locale');
        
        if (!locale) {
          console.error('Locale not found');
          return;
        }
        
        try {
          await window.i18n.setLocale(locale);
          
          // 更新选中状态
          container.querySelectorAll('.lang-button').forEach(btn => {
            btn.classList.remove('active');
          });
          button.classList.add('active');
          
          // 重新翻译页面
          translatePage();
        } catch (error) {
          console.error('Failed to switch language:', error);
        }
      });
    });
  }

  console.log(`✅ Language switcher created for container: ${containerId}`);
}

/**
 * 初始化 i18n（推荐在页面加载时调用）
 * @param {object} options - 配置选项
 */
async function initI18n(options = {}) {
  const {
    autoDetect = true,
    defaultLocale = 'zh',
    translateOnInit = true,
    createSwitcher = false,
    switcherContainerId = 'languageSwitcher',
    switcherOptions = {}
  } = options;

  try {
    // 检测或使用默认语言
    const locale = autoDetect ? window.i18n.autoDetectLocale() : defaultLocale;
    
    // 初始化 i18n
    await window.i18n.init(locale);
    
    // 翻译页面
    if (translateOnInit) {
      translatePage();
    }
    
    // 创建语言切换器
    if (createSwitcher) {
      createLanguageSwitcher(switcherContainerId, switcherOptions);
    }
    
    // 监听语言切换事件
    window.addEventListener('localeChanged', () => {
      translatePage();
    });
    
    console.log('✅ i18n initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize i18n:', error);
    return false;
  }
}

/**
 * 获取当前语言的文本方向
 * @returns {string} 'ltr' 或 'rtl'
 */
function getTextDirection() {
  return window.i18n.getDirection();
}

/**
 * 设置页面语言属性
 */
function setPageLanguageAttributes() {
  const locale = window.i18n.getLocale();
  const direction = getTextDirection();
  
  document.documentElement.setAttribute('lang', locale);
  document.documentElement.setAttribute('dir', direction);
}

// 监听语言切换，更新页面属性
if (typeof window !== 'undefined') {
  window.addEventListener('localeChanged', () => {
    setPageLanguageAttributes();
  });
}

// 导出函数
if (typeof window !== 'undefined') {
  window.translatePage = translatePage;
  window.getFlagEmoji = getFlagEmoji;
  window.createLanguageSwitcher = createLanguageSwitcher;
  window.initI18n = initI18n;
  window.getTextDirection = getTextDirection;
  window.setPageLanguageAttributes = setPageLanguageAttributes;
}

