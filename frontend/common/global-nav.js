/**
 * 全局导航栏组件
 * 适用于所有应用层页面
 * 支持：返回/回主页、多语言、钱包连接、响应式设计
 */

/**
 * 初始化全局导航
 * @param {object} options - 配置选项
 * @param {string} options.currentPage - 当前页面标识（用于高亮导航）
 * @param {boolean} options.showBackButton - 是否显示返回按钮（默认 true）
 * @param {boolean} options.showHomeButton - 是否显示回主页按钮（默认 true）
 * @param {boolean} options.showWalletButton - 是否显示钱包连接按钮（默认 true）
 * @param {string} options.backUrl - 自定义返回 URL（默认 history.back()）
 */
async function initGlobalNav(options = {}) {
  const {
    currentPage = '',
    showBackButton = true,
    showHomeButton = true,
    showWalletButton = true,
    backUrl = null
  } = options;

  // 确保 i18n 已初始化
  if (!window.i18n) {
    console.error('Global nav: i18n not initialized, waiting...');
    // 等待 i18n 初始化
    await new Promise(resolve => {
      const checkI18n = setInterval(() => {
        if (window.i18n) {
          clearInterval(checkI18n);
          resolve();
        }
      }, 100);
      // 最多等待 5 秒
      setTimeout(() => {
        clearInterval(checkI18n);
        resolve();
      }, 5000);
    });
  }

  const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;

  // 导航菜单项配置
  const navItems = [
    { id: 'mall', label: 'nav.mall', icon: 'fa-store', href: '/mall/' },
    { id: 'artisans', label: 'nav.artisans', icon: 'fa-user-tie', href: '/artisans/' },
    { id: 'dao', label: 'nav.dao', icon: 'fa-landmark', href: '/dao/' },
    { id: 'checkin', label: 'nav.checkin', icon: 'fa-calendar-check', href: '/checkin/' },
    { id: 'rewards', label: 'nav.rewards', icon: 'fa-gift', href: '/rewards/' }
  ];

  // 构建导航 HTML
  const navHTML = `
    <nav class="global-nav">
      <div class="global-nav-container">
        <!-- Logo -->
        <a href="/" class="global-nav-logo">
          <div class="global-nav-logo-icon">
            <i class="fas fa-chess-rook"></i>
          </div>
          <div class="global-nav-logo-text">
            <div class="global-nav-logo-title" data-i18n="homepage.footer.brandName">非遗上链</div>
            <div class="global-nav-logo-subtitle">Heritage on Chain</div>
          </div>
        </a>
        
        <!-- 桌面端导航菜单 -->
        <div class="global-nav-menu">
          ${navItems.map(item => `
            <a href="${item.href}" class="${item.id === currentPage ? 'active' : ''}" data-i18n="global.${item.label}">
              ${t(`global.${item.label}`)}
            </a>
          `).join('')}
        </div>
        
        <!-- 工具栏 -->
        <div class="global-nav-tools">
          ${showBackButton ? `
            <button class="global-nav-back-btn" id="globalNavBackBtn" title="${t('common.back')}">
              <i class="fas fa-arrow-left"></i>
            </button>
          ` : ''}
          ${showHomeButton ? `
            <button class="global-nav-home-btn" id="globalNavHomeBtn" title="${t('common.home')}">
              <i class="fas fa-home"></i>
            </button>
          ` : ''}
          <div id="languageSwitcher"></div>
          ${showWalletButton ? `
            <button class="global-nav-wallet-btn" id="globalNavWalletBtn">
              <i class="fab fa-ethereum"></i>
              <span data-i18n="wallet.connect">${t('wallet.connect')}</span>
            </button>
          ` : ''}
          <button class="global-nav-mobile-toggle" id="globalNavMobileToggle">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
      
      <!-- 移动端菜单 -->
      <div class="global-nav-mobile-menu" id="globalNavMobileMenu">
        <div class="global-nav-mobile-menu-content">
          ${navItems.map(item => `
            <a href="${item.href}" class="${item.id === currentPage ? 'active' : ''}" data-i18n="global.${item.label}">
              <i class="fas ${item.icon}"></i>
              ${t(`global.${item.label}`)}
            </a>
          `).join('')}
          
          <div class="global-nav-mobile-tools">
            <div id="languageSwitcherMobile"></div>
            ${showWalletButton ? `
              <button class="global-nav-wallet-btn" id="globalNavWalletBtnMobile" style="width: 100%; justify-content: center;">
                <i class="fab fa-ethereum"></i>
                <span data-i18n="wallet.connect">${t('wallet.connect')}</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </nav>
  `;

  // 插入导航栏到页面
  const navContainer = document.getElementById('globalNavContainer');
  if (navContainer) {
    navContainer.innerHTML = navHTML;
  } else {
    // 如果没有容器，插入到 body 开头
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  }

  // 给 body 添加类名（用于顶部留白）
  document.body.classList.add('has-global-nav');

  // 绑定事件
  bindGlobalNavEvents(backUrl);

  // 初始化语言切换器（如果 i18n-helper 已加载）
  if (window.createLanguageSwitcher) {
    window.createLanguageSwitcher('languageSwitcher', {
      showFlag: true,
      showText: false,
      style: 'dropdown'
    });
    
    // 移动端语言切换器
    if (document.getElementById('languageSwitcherMobile')) {
      window.createLanguageSwitcher('languageSwitcherMobile', {
        showFlag: true,
        showText: true,
        style: 'dropdown'
      });
    }
  }

  // 初始化钱包连接按钮
  initWalletButton();

  console.log('✅ Global navigation initialized');
}

/**
 * 绑定导航栏事件
 */
function bindGlobalNavEvents(customBackUrl) {
  // 返回按钮
  const backBtn = document.getElementById('globalNavBackBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (customBackUrl) {
        window.location.href = customBackUrl;
      } else if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    });
  }

  // 回主页按钮
  const homeBtn = document.getElementById('globalNavHomeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  // 移动端菜单切换
  const mobileToggle = document.getElementById('globalNavMobileToggle');
  const mobileMenu = document.getElementById('globalNavMobileMenu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('show');
      const icon = mobileToggle.querySelector('i');
      if (mobileMenu.classList.contains('show')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileMenu.classList.remove('show');
        const icon = mobileToggle.querySelector('i');
        icon.className = 'fas fa-bars';
      }
    });

    // 点击菜单项后关闭菜单
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('show');
        const icon = mobileToggle.querySelector('i');
        icon.className = 'fas fa-bars';
      });
    });
  }
}

/**
 * 初始化钱包连接按钮
 */
function initWalletButton() {
  const walletBtn = document.getElementById('globalNavWalletBtn');
  const walletBtnMobile = document.getElementById('globalNavWalletBtnMobile');
  
  // 检查是否已连接钱包
  if (window.ethereum) {
    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length > 0) {
          updateWalletButton(accounts[0], true);
        }
      })
      .catch(err => console.error('Check wallet failed:', err));
  }

  // 绑定点击事件
  [walletBtn, walletBtnMobile].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', async () => {
        await connectWallet();
      });
    }
  });

  // 监听账户变化
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        updateWalletButton(null, false);
      } else {
        updateWalletButton(accounts[0], true);
      }
    });
  }
}

/**
 * 连接钱包
 */
async function connectWallet() {
  if (!window.ethereum) {
    alert(window.i18n ? window.i18n.t('wallet.notDetected') : 'Please install MetaMask');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length > 0) {
      updateWalletButton(accounts[0], true);
      console.log('Wallet connected:', accounts[0]);
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('walletConnected', { detail: { address: accounts[0] } }));
    }
  } catch (error) {
    console.error('Connect wallet failed:', error);
    alert(window.i18n ? window.i18n.t('wallet.connectFailed') : 'Failed to connect wallet');
  }
}

/**
 * 更新钱包按钮状态
 */
function updateWalletButton(address, connected) {
  const walletBtn = document.getElementById('globalNavWalletBtn');
  const walletBtnMobile = document.getElementById('globalNavWalletBtnMobile');
  
  [walletBtn, walletBtnMobile].forEach(btn => {
    if (btn) {
      if (connected && address) {
        btn.classList.add('connected');
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = shortAddress;
        }
      } else {
        btn.classList.remove('connected');
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = window.i18n ? window.i18n.t('wallet.connect') : 'Connect Wallet';
        }
      }
    }
  });
}

// 导出函数供全局使用
window.initGlobalNav = initGlobalNav;
window.connectWallet = connectWallet;

console.log('✅ global-nav.js loaded');

