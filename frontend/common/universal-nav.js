/**
 * 通用顶部导航栏组件
 * 为所有页面提供统一的导航体验
 */

(function() {
  'use strict';

  // 导航配置
  const NAV_CONFIG = {
    // 主页路径（相对于当前页面）
    homePath: '../index.html',
    // 导航栏高度
    height: '64px',
    // 主题色
    primaryColor: '#9E2A2B',
    lineColor: '#D5BDAF',
    paperColor: '#F9F6F0',
    inkColor: '#2D2A26'
  };

  /**
   * 创建导航栏 HTML
   * @param {Object} options - 配置选项
   * @returns {string} HTML 字符串
   */
  function createNavHTML(options = {}) {
    const {
      title = '非遗上链',
      subtitle = '传承千年工艺',
      showBackButton = true,
      showHomeButton = true,
      showWalletButton = true,
      customButtons = [],
      logoIcon = 'fa-chess-rook',
      homePath = NAV_CONFIG.homePath
    } = options;

    // 自动计算返回路径深度
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const backPath = depth > 1 ? '../'.repeat(depth - 1) + 'index.html' : homePath;

    return `
      <nav id="universal-nav" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: ${NAV_CONFIG.height};
        background: ${NAV_CONFIG.paperColor}ee;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid ${NAV_CONFIG.lineColor};
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      ">
        <div style="
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <!-- 左侧：返回按钮 + Logo + 标题 -->
          <div style="display: flex; align-items: center; gap: 12px;">
            ${showBackButton ? `
              <button 
                onclick="window.history.length > 1 ? window.history.back() : window.location.href='${backPath}'" 
                style="
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  border: none;
                  background: ${NAV_CONFIG.lineColor};
                  color: ${NAV_CONFIG.inkColor};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  font-size: 16px;
                "
                onmouseover="this.style.background='${NAV_CONFIG.primaryColor}'; this.style.color='${NAV_CONFIG.paperColor}'"
                onmouseout="this.style.background='${NAV_CONFIG.lineColor}'; this.style.color='${NAV_CONFIG.inkColor}'"
                title="返回上一页"
              >
                <i class="fas fa-arrow-left"></i>
              </button>
            ` : ''}
            
            ${showHomeButton ? `
              <a href="${homePath}" style="
                display: flex;
                align-items: center;
                text-decoration: none;
                gap: 12px;
              ">
                <div style="
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: ${NAV_CONFIG.primaryColor};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 18px;
                ">
                  <i class="fas ${logoIcon}"></i>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <div style="
                    font-size: 18px;
                    font-weight: 700;
                    color: ${NAV_CONFIG.primaryColor};
                    line-height: 1.2;
                  ">${title}</div>
                  <div style="
                    font-size: 12px;
                    color: ${NAV_CONFIG.inkColor}99;
                    line-height: 1.2;
                  ">${subtitle}</div>
                </div>
              </a>
            ` : ''}
          </div>

          <!-- 右侧：钱包按钮 + 自定义按钮 -->
          <div style="display: flex; align-items: center; gap: 12px;">
            ${customButtons.map(btn => `
              <button 
                onclick="${btn.onClick || ''}"
                style="
                  padding: 8px 16px;
                  border-radius: 20px;
                  border: 1px solid ${NAV_CONFIG.primaryColor}66;
                  background: transparent;
                  color: ${NAV_CONFIG.primaryColor};
                  font-size: 14px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  white-space: nowrap;
                "
                onmouseover="this.style.background='${NAV_CONFIG.primaryColor}'; this.style.color='white'"
                onmouseout="this.style.background='transparent'; this.style.color='${NAV_CONFIG.primaryColor}'"
              >
                ${btn.icon ? `<i class="fas ${btn.icon}" style="margin-right: 6px;"></i>` : ''}
                <span class="nav-btn-text">${btn.text}</span>
              </button>
            `).join('')}
            
            ${showWalletButton ? `
              <button 
                id="universal-wallet-btn"
                style="
                  padding: 10px 20px;
                  border-radius: 24px;
                  border: none;
                  background: linear-gradient(90deg, ${NAV_CONFIG.primaryColor}, ${NAV_CONFIG.lineColor});
                  color: white;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 2px 8px ${NAV_CONFIG.primaryColor}44;
                  white-space: nowrap;
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px ${NAV_CONFIG.primaryColor}66'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px ${NAV_CONFIG.primaryColor}44'"
              >
                <i class="fab fa-ethereum" style="margin-right: 6px;"></i>
                <span class="nav-btn-text">连接钱包</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 移动端优化样式 -->
        <style>
          @media (max-width: 640px) {
            #universal-nav .nav-btn-text {
              display: none;
            }
            #universal-nav [style*="padding: 10px 20px"] {
              padding: 10px 12px !important;
            }
            #universal-nav [style*="padding: 8px 16px"] {
              padding: 8px 10px !important;
            }
          }
        </style>
      </nav>

      <!-- 占位符，防止内容被导航栏遮挡 -->
      <div style="height: ${NAV_CONFIG.height};"></div>
    `;
  }

  /**
   * 初始化导航栏
   * @param {Object} options - 配置选项
   */
  function initUniversalNav(options = {}) {
    // 确保 Font Awesome 已加载
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.bootcdn.net/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }

    // 在 body 开头插入导航栏
    const navHTML = createNavHTML(options);
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // 初始化钱包按钮
    const walletBtn = document.getElementById('universal-wallet-btn');
    if (walletBtn && options.showWalletButton !== false) {
      initWalletButton(walletBtn);
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('universalNavReady', { detail: { options } }));
  }

  /**
   * 初始化钱包连接按钮
   */
  function initWalletButton(button) {
    // 检查是否已连接钱包
    checkWalletConnection();

    // 点击事件
    button.addEventListener('click', async () => {
      if (!window.ethereum) {
        alert('请安装 MetaMask 钱包插件！');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts[0]) {
          const address = accounts[0];
          updateWalletButton(button, address);
          
          // 保存到 localStorage
          localStorage.setItem('wallet_address', address);
          
          // 触发连接成功事件
          window.dispatchEvent(new CustomEvent('walletConnected', { 
            detail: { address } 
          }));
        }
      } catch (error) {
        console.error('钱包连接失败:', error);
        alert('钱包连接失败: ' + error.message);
      }
    });
  }

  /**
   * 检查钱包连接状态
   */
  async function checkWalletConnection() {
    const button = document.getElementById('universal-wallet-btn');
    if (!button) return;

    // 检查 localStorage
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedAddress) {
      updateWalletButton(button, savedAddress);
      return;
    }

    // 检查 MetaMask
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts && accounts[0]) {
          updateWalletButton(button, accounts[0]);
          localStorage.setItem('wallet_address', accounts[0]);
        }
      } catch (error) {
        console.error('检查钱包状态失败:', error);
      }
    }
  }

  /**
   * 更新钱包按钮显示
   */
  function updateWalletButton(button, address) {
    const shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
    const textSpan = button.querySelector('.nav-btn-text');
    if (textSpan) {
      textSpan.textContent = shortAddress;
    }
    button.style.background = `linear-gradient(90deg, #34c759, #30a14e)`;
  }

  /**
   * 监听账户变化
   */
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      const button = document.getElementById('universal-wallet-btn');
      if (accounts && accounts[0]) {
        updateWalletButton(button, accounts[0]);
        localStorage.setItem('wallet_address', accounts[0]);
      } else {
        localStorage.removeItem('wallet_address');
        if (button) {
          const textSpan = button.querySelector('.nav-btn-text');
          if (textSpan) {
            textSpan.textContent = '连接钱包';
          }
          button.style.background = `linear-gradient(90deg, ${NAV_CONFIG.primaryColor}, ${NAV_CONFIG.lineColor})`;
        }
      }
    });
  }

  // 导出到全局
  window.UniversalNav = {
    init: initUniversalNav,
    config: NAV_CONFIG
  };

  // 自动初始化（如果页面有 data-auto-nav 属性）
  if (document.documentElement.hasAttribute('data-auto-nav')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const config = document.documentElement.dataset.navConfig;
        initUniversalNav(config ? JSON.parse(config) : {});
      });
    } else {
      const config = document.documentElement.dataset.navConfig;
      initUniversalNav(config ? JSON.parse(config) : {});
    }
  }
})();

