/**
 * 简单高效的 i18n 国际化引擎
 * 支持 7 种语言：中文、英文、日文、法文、西班牙语、俄罗斯语、马来语
 */

class I18n {
  constructor() {
    this.locale = 'zh'; // 默认语言
    this.fallbackLocale = 'zh'; // 回退语言
    this.messages = {};
    this.loadedLanguages = [];
    this.listeners = [];
  }

  /**
   * 初始化 i18n
   * @param {string} locale - 语言代码
   */
  async init(locale = 'zh') {
    this.locale = locale;
    await this.loadLanguage(locale);
    
    // 如果不是默认语言，也加载默认语言作为回退
    if (locale !== this.fallbackLocale) {
      await this.loadLanguage(this.fallbackLocale);
    }
    
    console.log(`✅ i18n initialized with locale: ${locale}`);
  }

  /**
   * 加载语言包
   * @param {string} locale - 语言代码
   */
  async loadLanguage(locale) {
    if (this.loadedLanguages.includes(locale)) {
      return;
    }

    try {
      const response = await fetch(`/i18n/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language: ${locale}`);
      }
      
      const messages = await response.json();
      this.messages[locale] = messages;
      this.loadedLanguages.push(locale);
      console.log(`✅ Loaded language: ${locale}`);
    } catch (error) {
      console.error(`❌ Failed to load language: ${locale}`, error);
      
      // 如果加载失败，使用空对象
      this.messages[locale] = {};
      this.loadedLanguages.push(locale);
    }
  }

  /**
   * 切换语言
   * @param {string} locale - 语言代码
   */
  async setLocale(locale) {
    if (!this.getAvailableLocales().includes(locale)) {
      console.warn(`Locale ${locale} is not supported`);
      return;
    }

    if (!this.loadedLanguages.includes(locale)) {
      await this.loadLanguage(locale);
    }
    
    this.locale = locale;
    localStorage.setItem('preferred_language', locale);
    
    // 触发语言切换事件
    this.notifyListeners(locale);
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
    
    console.log(`✅ Locale changed to: ${locale}`);
  }

  /**
   * 获取翻译
   * @param {string} key - 翻译 key（支持点号分隔的路径）
   * @param {object} params - 参数对象
   * @returns {string} 翻译后的文本
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let message = this.messages[this.locale];
    
    // 遍历 key 路径
    for (const k of keys) {
      if (message && typeof message === 'object') {
        message = message[k];
      } else {
        message = undefined;
        break;
      }
    }

    // 如果找不到，使用回退语言
    if (message === undefined && this.locale !== this.fallbackLocale) {
      let fallbackMessage = this.messages[this.fallbackLocale];
      for (const k of keys) {
        if (fallbackMessage && typeof fallbackMessage === 'object') {
          fallbackMessage = fallbackMessage[k];
        } else {
          fallbackMessage = undefined;
          break;
        }
      }
      message = fallbackMessage;
    }

    // 如果还是找不到，返回 key
    if (message === undefined) {
      console.warn(`Translation missing: ${key} (locale: ${this.locale})`);
      return key;
    }

    // 替换参数
    if (typeof message === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      });
    }

    return message;
  }

  /**
   * 获取当前语言
   * @returns {string} 当前语言代码
   */
  getLocale() {
    return this.locale;
  }

  /**
   * 获取所有支持的语言
   * @returns {array} 语言代码数组
   */
  getAvailableLocales() {
    return ['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'];
  }

  /**
   * 获取语言名称
   * @param {string} locale - 语言代码
   * @returns {string} 语言名称
   */
  getLocaleName(locale) {
    const names = {
      zh: '中文',
      en: 'English',
      ja: '日本語',
      fr: 'Français',
      es: 'Español',
      ru: 'Русский',
      ms: 'Bahasa Melayu'
    };
    return names[locale] || locale;
  }

  /**
   * 获取语言的本地化名称（用该语言显示）
   * @param {string} locale - 语言代码
   * @returns {string} 本地化语言名称
   */
  getLocaleNativeName(locale) {
    return this.getLocaleName(locale);
  }

  /**
   * 从 URL 检测语言
   * @returns {string|null} 语言代码或 null
   */
  detectLocaleFromURL() {
    const path = window.location.pathname;
    const match = path.match(/^\/(zh|en|ja|fr|es|ru|ms)\//);
    return match ? match[1] : null;
  }

  /**
   * 从浏览器检测语言
   * @returns {string} 语言代码
   */
  detectLocaleFromBrowser() {
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.split('-')[0];
    const available = this.getAvailableLocales();
    return available.includes(lang) ? lang : 'zh';
  }

  /**
   * 自动检测语言
   * @returns {string} 语言代码
   */
  autoDetectLocale() {
    // 1. 从 URL 检测
    const urlLocale = this.detectLocaleFromURL();
    if (urlLocale) {
      console.log(`Detected locale from URL: ${urlLocale}`);
      return urlLocale;
    }

    // 2. 从 localStorage 检测
    const savedLocale = localStorage.getItem('preferred_language');
    if (savedLocale && this.getAvailableLocales().includes(savedLocale)) {
      console.log(`Detected locale from localStorage: ${savedLocale}`);
      return savedLocale;
    }

    // 3. 从浏览器检测
    const browserLocale = this.detectLocaleFromBrowser();
    console.log(`Detected locale from browser: ${browserLocale}`);
    return browserLocale;
  }

  /**
   * 添加语言切换监听器
   * @param {function} callback - 回调函数
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * 移除语言切换监听器
   * @param {function} callback - 回调函数
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * 通知所有监听器
   * @param {string} locale - 新的语言代码
   */
  notifyListeners(locale) {
    this.listeners.forEach(callback => {
      try {
        callback(locale);
      } catch (error) {
        console.error('Error in locale change listener:', error);
      }
    });
  }

  /**
   * 获取语言方向（LTR 或 RTL）
   * @param {string} locale - 语言代码
   * @returns {string} 'ltr' 或 'rtl'
   */
  getDirection(locale = this.locale) {
    // 目前支持的语言都是 LTR
    // 如果将来支持阿拉伯语、希伯来语等，需要返回 'rtl'
    return 'ltr';
  }

  /**
   * 格式化数字
   * @param {number} number - 数字
   * @param {object} options - Intl.NumberFormat 选项
   * @returns {string} 格式化后的数字
   */
  formatNumber(number, options = {}) {
    try {
      return new Intl.NumberFormat(this.locale, options).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  }

  /**
   * 格式化日期
   * @param {Date|string|number} date - 日期
   * @param {object} options - Intl.DateTimeFormat 选项
   * @returns {string} 格式化后的日期
   */
  formatDate(date, options = {}) {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(this.locale, options).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toString();
    }
  }

  /**
   * 格式化货币
   * @param {number} amount - 金额
   * @param {string} currency - 货币代码（如 'USD', 'CNY'）
   * @param {object} options - 额外选项
   * @returns {string} 格式化后的货币
   */
  formatCurrency(amount, currency = 'CNY', options = {}) {
    try {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: currency,
        ...options
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency} ${amount}`;
    }
  }
}

// 创建全局实例
if (typeof window !== 'undefined') {
  window.i18n = new I18n();
  
  // 简化的翻译函数
  window.t = (key, params) => window.i18n.t(key, params);
  
  console.log('✅ i18n engine loaded');
}

// 支持 ES6 模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}

