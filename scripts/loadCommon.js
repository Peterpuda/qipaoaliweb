/* ===============================================
   公共组件加载脚本 - loadCommon.js
   用于自动加载 header.html 与 footer.html
   统一页面结构与交互逻辑
   =============================================== */

   export async function loadCommon() {
    try {
      // 动态加载 Header
      const headerRes = await fetch("/frontend/common/header.html");
      const headerHTML = await headerRes.text();
      document.body.insertAdjacentHTML("afterbegin", headerHTML);
  
      // 动态加载 Footer
      const footerRes = await fetch("/frontend/common/footer.html");
      const footerHTML = await footerRes.text();
      document.body.insertAdjacentHTML("beforeend", footerHTML);
  
      // 延迟初始化交互（等待DOM插入完成）
      setTimeout(initInteractions, 300);
    } catch (error) {
      console.error("❌ 加载公共组件失败：", error);
    }
  }
  
  /* ===============================================
     初始化交互逻辑
     - 钱包连接按钮
     - 滚动导航阴影变化
     - 平滑滚动
     =============================================== */
  function initInteractions() {
    const navbar = document.getElementById("navbar");
    const walletBtn = document.getElementById("walletButton");
    const mobileWalletBtn = document.getElementById("mobileWalletBtn");
  
    // ✅ 钱包连接按钮（调用 web3.js）
    async function connectWallet() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const address = accounts[0];
          const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
          walletBtn.textContent = shortAddr;
          if (mobileWalletBtn) mobileWalletBtn.textContent = shortAddr;
        } catch (err) {
          alert("连接钱包失败：" + err.message);
        }
      } else {
        alert("未检测到 MetaMask 或兼容钱包。");
      }
    }
  
    if (walletBtn) walletBtn.addEventListener("click", connectWallet);
    if (mobileWalletBtn) mobileWalletBtn.addEventListener("click", connectWallet);
  
    // ✅ 导航栏滚动阴影变化
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > 50) {
        navbar.classList.add("shadow-md");
      } else {
        navbar.classList.remove("shadow-md");
      }
    });
  
    // ✅ 平滑滚动跳转
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        if (targetId && targetId !== "#") {
          const target = document.querySelector(targetId);
          if (target) {
            window.scrollTo({
              top: target.offsetTop - 80,
              behavior: "smooth",
            });
          }
        }
      });
    });
  }
  
  /* ===============================================
     使用方法（示例）
     -----------------------------------------------
     在页面中：
     <script type="module">
       import { loadCommon } from '../scripts/loadCommon.js'
       loadCommon()
     </script>
     =============================================== */