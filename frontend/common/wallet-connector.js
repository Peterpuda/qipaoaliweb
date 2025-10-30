/**
 * 通用钱包连接器
 * 支持多种钱包，特别优化移动端体验
 */

const WalletConnector = (() => {
  // 钱包配置
  const WALLETS = {
    metamask: {
      name: 'MetaMask',
      icon: '🦊',
      check: () => window.ethereum?.isMetaMask,
      deepLink: (url) => `https://metamask.app.link/dapp/${url}`,
      downloadUrl: 'https://metamask.io/download/',
    },
    coinbase: {
      name: 'Coinbase Wallet',
      icon: '🔵',
      check: () => window.ethereum?.isCoinbaseWallet || window.coinbaseWalletExtension,
      deepLink: (url) => `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent('https://' + url)}`,
      downloadUrl: 'https://www.coinbase.com/wallet/downloads',
    },
    trust: {
      name: 'Trust Wallet',
      icon: '🛡️',
      check: () => window.ethereum?.isTrust,
      deepLink: (url) => `trust://open_url?coin_id=60&url=https://${url}`,
      downloadUrl: 'https://trustwallet.com/download',
    },
    imtoken: {
      name: 'imToken',
      icon: '💎',
      check: () => window.ethereum?.isImToken,
      deepLink: (url) => `imtokenv2://navigate/DappView?url=https://${url}`,
      downloadUrl: 'https://token.im/download',
    },
    tokenpocket: {
      name: 'TokenPocket',
      icon: '🎒',
      check: () => window.ethereum?.isTokenPocket,
      deepLink: (url) => `tpoutside://open?params=${encodeURIComponent(JSON.stringify({url: 'https://' + url, chain: 'ETH'}))}`,
      downloadUrl: 'https://www.tokenpocket.pro/en/download/app',
    },
    okx: {
      name: 'OKX Wallet',
      icon: '⭕',
      check: () => window.okxwallet || window.ethereum?.isOkxWallet,
      deepLink: (url) => `okx://wallet/dapp/url?dappUrl=https://${url}`,
      downloadUrl: 'https://www.okx.com/web3',
    },
    bitget: {
      name: 'Bitget Wallet',
      icon: '🅱️',
      check: () => window.bitkeep?.ethereum || window.ethereum?.isBitKeep,
      deepLink: (url) => `bitkeep://bkconnect?action=dapp&url=https://${url}`,
      downloadUrl: 'https://web3.bitget.com/en/wallet-download',
    },
    phantom: {
      name: 'Phantom',
      icon: '👻',
      check: () => window.phantom?.ethereum,
      deepLink: (url) => `https://phantom.app/ul/browse/${encodeURIComponent('https://' + url)}`,
      downloadUrl: 'https://phantom.app/download',
    },
    walletconnect: {
      name: 'WalletConnect',
      icon: '🔗',
      check: () => false, // 需要单独处理
      isUniversal: true,
      downloadUrl: 'https://walletconnect.com/wallets',
    }
  };

  let currentProvider = null;
  let currentWallet = null;
  let currentAddress = null;

  // 检测设备类型
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // 检测已安装的钱包
  function detectInstalledWallets() {
    const installed = [];
    
    // 检查浏览器扩展钱包
    if (window.ethereum) {
      // 处理多个钱包提供者
      const providers = window.ethereum.providers || [window.ethereum];
      
      for (const [key, wallet] of Object.entries(WALLETS)) {
        if (wallet.isUniversal) continue;
        
        // 检查是否安装
        if (providers.some(p => wallet.check())) {
          installed.push({
            id: key,
            ...wallet,
            provider: providers.find(p => wallet.check()) || window.ethereum
          });
        }
      }
    }

    // 检查特殊钱包
    if (window.okxwallet) {
      installed.push({
        id: 'okx',
        ...WALLETS.okx,
        provider: window.okxwallet
      });
    }

    if (window.phantom?.ethereum) {
      installed.push({
        id: 'phantom',
        ...WALLETS.phantom,
        provider: window.phantom.ethereum
      });
    }

    // 如果没有检测到任何钱包，但有 window.ethereum，添加为通用钱包
    if (installed.length === 0 && window.ethereum) {
      installed.push({
        id: 'generic',
        name: '浏览器钱包',
        icon: '💼',
        provider: window.ethereum
      });
    }

    return installed;
  }

  // 显示钱包选择器
  function showWalletSelector(onSelect) {
    const installed = detectInstalledWallets();
    const mobile = isMobile();

    // 创建模态框
    const modal = document.createElement('div');
    modal.id = 'walletSelectorModal';
    modal.className = 'wallet-modal-overlay';
    
    let walletsHTML = '';

    if (installed.length > 0) {
      walletsHTML += '<div class="wallet-section"><h3>已安装的钱包</h3><div class="wallet-list">';
      installed.forEach(wallet => {
        walletsHTML += `
          <button class="wallet-option" data-wallet-id="${wallet.id}">
            <span class="wallet-icon">${wallet.icon}</span>
            <span class="wallet-name">${wallet.name}</span>
            <span class="wallet-status">✅ 已安装</span>
          </button>
        `;
      });
      walletsHTML += '</div></div>';
    }

    // 移动端显示所有钱包（通过 Deep Link 唤起）
    if (mobile) {
      walletsHTML += '<div class="wallet-section"><h3>其他钱包</h3><div class="wallet-list">';
      for (const [key, wallet] of Object.entries(WALLETS)) {
        if (wallet.isUniversal || installed.some(w => w.id === key)) continue;
        walletsHTML += `
          <button class="wallet-option" data-wallet-id="${key}" data-deep-link="true">
            <span class="wallet-icon">${wallet.icon}</span>
            <span class="wallet-name">${wallet.name}</span>
            <span class="wallet-status">📱 打开应用</span>
          </button>
        `;
      }
      walletsHTML += '</div></div>';
    } else {
      // 桌面端显示下载链接
      walletsHTML += '<div class="wallet-section"><h3>推荐钱包</h3><div class="wallet-list">';
      const recommended = ['metamask', 'coinbase', 'okx', 'phantom'];
      recommended.forEach(key => {
        if (installed.some(w => w.id === key)) return;
        const wallet = WALLETS[key];
        walletsHTML += `
          <button class="wallet-option" data-download-url="${wallet.downloadUrl}">
            <span class="wallet-icon">${wallet.icon}</span>
            <span class="wallet-name">${wallet.name}</span>
            <span class="wallet-status">⬇️ 下载</span>
          </button>
        `;
      });
      walletsHTML += '</div></div>';
    }

    modal.innerHTML = `
      <div class="wallet-modal-content">
        <div class="wallet-modal-header">
          <h2>连接钱包</h2>
          <button class="wallet-modal-close" onclick="WalletConnector.closeModal()">×</button>
        </div>
        <div class="wallet-modal-body">
          ${walletsHTML}
        </div>
        <div class="wallet-modal-footer">
          <p class="wallet-help-text">
            ${mobile ? '📱 选择钱包将打开对应的应用' : '💡 没有钱包？点击下载安装'}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 绑定事件
    modal.querySelectorAll('.wallet-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const walletId = btn.dataset.walletId;
        const deepLink = btn.dataset.deepLink === 'true';
        const downloadUrl = btn.dataset.downloadUrl;

        if (downloadUrl) {
          // 打开下载页面
          window.open(downloadUrl, '_blank');
        } else if (deepLink) {
          // 移动端通过 Deep Link 唤起钱包
          const wallet = WALLETS[walletId];
          const currentUrl = location.host + location.pathname + location.search;
          const deepLinkUrl = wallet.deepLink(currentUrl);
          
          // 尝试打开 Deep Link
          window.location.href = deepLinkUrl;
          
          // 2秒后提示
          setTimeout(() => {
            if (document.hasFocus()) {
              alert(`请先安装 ${wallet.name}\n或在 ${wallet.name} 应用内打开此页面`);
            }
          }, 2000);
        } else {
          // 连接已安装的钱包
          const wallet = installed.find(w => w.id === walletId);
          if (wallet) {
            closeModal();
            onSelect(wallet);
          }
        }
      });
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // 关闭模态框
  function closeModal() {
    const modal = document.getElementById('walletSelectorModal');
    if (modal) {
      modal.remove();
    }
  }

  // 连接钱包
  async function connect(options = {}) {
    return new Promise((resolve, reject) => {
      showWalletSelector(async (wallet) => {
        try {
          currentWallet = wallet;
          currentProvider = wallet.provider;

          // 请求账户
          const accounts = await currentProvider.request({
            method: 'eth_requestAccounts'
          });

          if (!accounts || accounts.length === 0) {
            throw new Error('未获取到账户');
          }

          currentAddress = accounts[0];

          // 如果需要切换网络
          if (options.chainId) {
            await switchNetwork(options.chainId, options.chainConfig);
          }

          // 监听账户变化
          if (currentProvider.on) {
            currentProvider.on('accountsChanged', (accounts) => {
              if (accounts.length === 0) {
                disconnect();
              } else {
                currentAddress = accounts[0];
                if (options.onAccountChanged) {
                  options.onAccountChanged(accounts[0]);
                }
              }
            });

            currentProvider.on('chainChanged', () => {
              if (options.onChainChanged) {
                options.onChainChanged();
              }
            });
          }

          resolve({
            address: currentAddress,
            provider: currentProvider,
            wallet: wallet.name
          });

        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // 切换网络
  async function switchNetwork(chainId, chainConfig) {
    if (!currentProvider) {
      throw new Error('请先连接钱包');
    }

    try {
      await currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      // 如果网络不存在，尝试添加
      if (switchError.code === 4902 && chainConfig) {
        try {
          await currentProvider.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
        } catch (addError) {
          throw new Error('添加网络失败: ' + addError.message);
        }
      } else {
        throw new Error('切换网络失败: ' + switchError.message);
      }
    }
  }

  // 断开连接
  function disconnect() {
    currentProvider = null;
    currentWallet = null;
    currentAddress = null;
  }

  // 获取当前状态
  function getState() {
    return {
      connected: !!currentAddress,
      address: currentAddress,
      wallet: currentWallet?.name,
      provider: currentProvider
    };
  }

  // 短地址显示
  function shortAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // 导出公共 API
  return {
    connect,
    disconnect,
    switchNetwork,
    getState,
    shortAddress,
    closeModal,
    isMobile,
    detectInstalledWallets
  };
})();

// 导出到全局
window.WalletConnector = WalletConnector;

