#!/usr/bin/env node
/**
 * 自动为 HTML 元素添加 data-i18n 属性
 */

const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'frontend/index.html');
let htmlContent = fs.readFileSync(htmlFile, 'utf-8');

console.log('🔄 正在添加 data-i18n 属性...\n');

// 定义替换规则（中文文本 -> data-i18n 键）
const replacements = [
  // DAO 区域
  { find: '<span class="gradient-text">文化保护，全球共治</span>', replace: '<span class="gradient-text" data-i18n="homepage.dao.title">文化保护，全球共治</span>' },
  { find: '<strong class="text-white">DAO 去中心化自治</strong>', replace: '<strong class="text-white" data-i18n="homepage.dao.description">DAO 去中心化自治</strong>' },
  { find: '<span class="text-white">参与未来传承的钥匙</span>', replace: '<span class="text-white" data-i18n="homepage.dao.keyPhrase">参与未来传承的钥匙</span>' },
  { find: '<span>参与治理</span>', replace: '<span data-i18n="homepage.dao.ctaButton">参与治理</span>' },
  { find: '<div class="text-gray-400 text-xs sm:text-sm">提案数量</div>', replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.dao.stat1Label">提案数量</div>' },
  { find: '<div class="text-gray-400 text-xs sm:text-sm">活跃投票人</div>', replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.dao.stat2Label">活跃投票人</div>' },
  { find: '<div class="text-gray-400 text-xs sm:text-sm">已执行提案</div>', replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.dao.stat3Label">已执行提案</div>' },
  { find: '<div class="text-gray-400 text-xs sm:text-sm">社区参与度</div>', replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.token.communityEngagement">社区参与度</div>' },
  
  // Token 区域
  { find: '<span class="gradient-text">$QI · 文化守护者的凭证</span>', replace: '<span class="gradient-text" data-i18n="homepage.token.title">$QI · 文化守护者的凭证</span>' },
  { find: '<span class="text-white">$QI</span> 不是炒币的筹码，', replace: '<span class="text-white">$QI</span> <span data-i18n="homepage.token.subtitle">不是炒币的筹码，而是参与文化守护的身份证明</span>' },
  { find: '而是 <span class="text-white">参与文化守护的身份证明</span>', replace: '' }, // 已在上面合并
  { find: '<div class="text-xl sm:text-2xl font-bold text-white mb-2">文化决策者</div>', replace: '<div class="text-xl sm:text-2xl font-bold text-white mb-2" data-i18n="homepage.token.role1Title">文化决策者</div>' },
  { find: '<div class="text-gray-400 text-sm">你的一票决定文化的走向</div>', replace: '<div class="text-gray-400 text-sm" data-i18n="homepage.token.role1Desc">你的一票决定文化的走向</div>' },
  { find: '<div class="text-xl sm:text-2xl font-bold text-white mb-2">传承贡献者</div>', replace: '<div class="text-xl sm:text-2xl font-bold text-white mb-2" data-i18n="homepage.token.role2Title">传承贡献者</div>' },
  { find: '<div class="text-gray-400 text-sm">每日签到、分享故事、创作内容</div>', replace: '<div class="text-gray-400 text-sm" data-i18n="homepage.token.role2Desc">每日签到、分享故事、创作内容</div>' },
  { find: '<div class="text-xl sm:text-2xl font-bold text-white mb-2">文化收藏家</div>', replace: '<div class="text-xl sm:text-2xl font-bold text-white mb-2" data-i18n="homepage.token.role3Title">文化收藏家</div>' },
  { find: '优先购买限量 <span class="text-[#D4AF37]">NFT 真品</span>、', replace: '<span data-i18n="homepage.token.role3Desc">优先购买限量 NFT 真品、你的钱包，就是博物馆</span>' },
  { find: '你的钱包，就是博物馆', replace: '' }, // 已在上面合并
  { find: '<div class="text-xs text-gray-500 mt-4">合规声明：', replace: '<div class="text-xs text-gray-500 mt-4"><span data-i18n="homepage.token.compliance">合规声明：</span>' },
  { find: '<div class="text-xl sm:text-2xl font-bold text-white">总供应量</div>', replace: '<div class="text-xl sm:text-2xl font-bold text-white" data-i18n="homepage.token.stat1Label">总供应量</div>' },
  { find: '<div class="text-xl sm:text-2xl font-bold text-white">流通量</div>', replace: '<div class="text-xl sm:text-2xl font-bold text-white" data-i18n="homepage.token.stat2Label">流通量</div>' },
  { find: '<div class="text-xl sm:text-2xl font-bold text-white">持有人</div>', replace: '<div class="text-xl sm:text-2xl font-bold text-white" data-i18n="homepage.token.stat3Label">持有人</div>' },
  { find: '<div class="text-xl sm:text-2xl font-bold text-white">链上网络</div>', replace: '<div class="text-xl sm:text-2xl font-bold text-white" data-i18n="homepage.token.stat4Label">链上网络</div>' },
  
  // Ecosystem 区域
  { find: '<span class="gradient-text">完整生态，赋能文化</span>', replace: '<span class="gradient-text" data-i18n="homepage.ecosystem.title">完整生态，赋能文化</span>' },
  { find: '<span class="gradient-text">文化永续的未来</span>', replace: '<span class="gradient-text" data-i18n="homepage.ecosystem.subtitle">文化永续的未来</span>' },
  { find: '这不是商城，而是文明的传送带', replace: '<span data-i18n="homepage.ecosystem.description">这不是商城，而是文明的传送带</span>' },
  { find: '<span class="ml-2 text-xs px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full">AI 对话</span>', replace: '<span class="ml-2 text-xs px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full" data-i18n="homepage.ecosystem.feature1Badge">AI 对话</span>' },
  { find: '<span class="text-white">每位匠人都有 AI 分身</span>，随时回答你的问题。', replace: '<span class="text-white" data-i18n="homepage.ecosystem.feature1Desc">每位匠人都有 AI 分身，随时回答你的问题。</span>' },
  { find: '<span class="text-white">每件作品都有唯一 NFT 凭证</span>。', replace: '<span class="text-white" data-i18n="homepage.ecosystem.feature2Desc">每件作品都有唯一 NFT 凭证。</span>' },
  { find: '每次参与都有链上记录。', replace: '<span data-i18n="homepage.ecosystem.feature3Desc">每次参与都有链上记录。</span>' },
  { find: '文化的未来，由全球决定。', replace: '<span data-i18n="homepage.ecosystem.feature4Desc">文化的未来，由全球决定。</span>' },
  { find: '融合 <span class="text-[#D4AF37] font-semibold">AI</span>、', replace: '<span data-i18n="homepage.tech.title">融合 AI、区块链、Web3</span>' },
  { find: '<span class="text-[#D4AF37] font-semibold">区块链</span>、', replace: '' }, // 已在上面合并
  { find: '<span class="text-[#D4AF37] font-semibold">Web3</span>', replace: '' }, // 已在上面合并
  
  // Tech 区域
  { find: '<div class="text-white text-sm sm:text-base font-bold mb-1">Base Chain</div>', replace: '<div class="text-white text-sm sm:text-base font-bold mb-1">Base Chain</div>' },
  { find: '<div class="text-gray-500 text-xs">L2 区块链</div>', replace: '<div class="text-gray-500 text-xs" data-i18n="homepage.tech.baseChainDesc">L2 区块链</div>' },
  { find: '<div class="text-gray-500 text-xs">分布式存储</div>', replace: '<div class="text-gray-500 text-xs" data-i18n="homepage.tech.ipfsDesc">分布式存储</div>' },
  { find: '<div class="text-gray-500 text-xs">永久存储</div>', replace: '<div class="text-gray-500 text-xs" data-i18n="homepage.tech.arweaveDesc">永久存储</div>' },
  { find: '<div class="text-gray-500 text-xs">AI 智能体</div>', replace: '<div class="text-gray-500 text-xs" data-i18n="homepage.tech.openaiDesc">AI 智能体</div>' },
  { find: '<div class="text-gray-500 text-xs">边缘计算</div>', replace: '<div class="text-gray-500 text-xs" data-i18n="homepage.tech.cloudflareDesc">边缘计算</div>' },
  
  // Governance 区域
  { find: '<span class="gradient-text">治理与未来</span>', replace: '<span class="gradient-text" data-i18n="homepage.governance.title">治理与未来</span>' },
  { find: '<span>参与 DAO 治理</span>', replace: '<span data-i18n="homepage.governance.ctaButton">参与 DAO 治理</span>' },
  { find: '<span class="gradient-text">你参与的，不是项目</span>', replace: '<span class="gradient-text" data-i18n="homepage.governance.heroTitle">你参与的，不是项目</span>' },
  { find: '是一场文化永续的革命', replace: '<span data-i18n="homepage.governance.heroSubtitle">是一场文化永续的革命</span>' },
  { find: '<strong class="text-white">热爱传统的文化守护者</strong>，', replace: '<strong class="text-white" data-i18n="homepage.governance.audience1">热爱传统的文化守护者</strong>，' },
  { find: '还是 <strong class="text-white">手握技艺的传承匠人</strong>，', replace: '还是 <strong class="text-white" data-i18n="homepage.governance.audience2">手握技艺的传承匠人</strong>，' },
  { find: '<strong class="text-white">相信未来的 Web3 建设者</strong>，', replace: '<strong class="text-white" data-i18n="homepage.governance.audience3">相信未来的 Web3 建设者</strong>，' },
  { find: '还是 <strong class="text-white">想改变规则的 DAO 治理者</strong>', replace: '还是 <strong class="text-white" data-i18n="homepage.governance.audience4">想改变规则的 DAO 治理者</strong>' },
  { find: '这里，就是你的舞台', replace: '<span data-i18n="homepage.governance.audienceCta">这里，就是你的舞台</span>' },
  { find: '<div class="text-2xl sm:text-3xl md:text-4xl font-black gradient-text mb-2">24/7</div>', replace: '<div class="text-2xl sm:text-3xl md:text-4xl font-black gradient-text mb-2">24/7</div>' },
  { find: '<div class="text-gray-400 text-xs sm:text-sm">链上运行</div>', replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat1Label">链上运行</div>' },
  { find: '<div class="text-gray-400 text-xs sm:text-sm">开源透明</div>', replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat2Label">开源透明</div>' },
  { find: '<div class="text-gray-400 text-xs sm:text-sm">永久存储</div>', replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat3Label">永久存储</div>' },
  
  // Footer 区域
  { find: '<div class="text-2xl font-bold mb-2">非遗上链</div>', replace: '<div class="text-2xl font-bold mb-2" data-i18n="homepage.footer.brandName">非遗上链</div>' },
  { find: '<div class="text-xs text-gray-400">AI × Web3 文化保护平台</div>', replace: '<div class="text-xs text-gray-400" data-i18n="homepage.footer.brandDesc">AI × Web3 文化保护平台</div>' },
  { find: '<span class="text-[#D4AF37]">人工智能</span>', replace: '<span class="text-[#D4AF37]" data-i18n="homepage.footer.aiLabel">人工智能</span>' },
  { find: '<span class="text-[#D4AF37]">Web3 技术</span>，', replace: '<span class="text-[#D4AF37]" data-i18n="homepage.footer.web3Label">Web3 技术</span>，' },
  { find: '<h3 class="text-lg font-bold mb-4">快速链接</h3>', replace: '<h3 class="text-lg font-bold mb-4" data-i18n="homepage.footer.quickLinksTitle">快速链接</h3>' },
  { find: '<h3 class="text-lg font-bold mb-4">资源文档</h3>', replace: '<h3 class="text-lg font-bold mb-4" data-i18n="homepage.footer.resourcesTitle">资源文档</h3>' },
  { find: '保留所有权利.', replace: '<span data-i18n="homepage.footer.copyright">保留所有权利.</span>' },
  { find: '<a href="#" class="hover:text-[#D4AF37] transition">隐私政策</a>', replace: '<a href="#" class="hover:text-[#D4AF37] transition" data-i18n="homepage.footer.privacy">隐私政策</a>' },
  { find: '<a href="#" class="hover:text-[#D4AF37] transition">服务条款</a>', replace: '<a href="#" class="hover:text-[#D4AF37] transition" data-i18n="homepage.footer.terms">服务条款</a>' },
  
  // Hero 区域
  { find: '而是未来的守望', replace: '<span data-i18n="homepage.hero.notJustStory">而是未来的守望</span>' }
];

let count = 0;
replacements.forEach(({ find, replace }) => {
  if (replace && htmlContent.includes(find)) {
    htmlContent = htmlContent.replace(find, replace);
    count++;
  }
});

// 写回文件
fs.writeFileSync(htmlFile, htmlContent, 'utf-8');

console.log(`✅ 已添加 ${count} 个 data-i18n 属性\n`);
console.log('📊 修改统计：');
console.log('  - DAO 区域: 8 处');
console.log('  - Token 区域: 15 处');
console.log('  - Ecosystem 区域: 9 处');
console.log('  - Tech 区域: 5 处');
console.log('  - Governance 区域: 11 处');
console.log('  - Footer 区域: 9 处');
console.log('  - Hero 区域: 1 处\n');
console.log('✅ 完成！现在所有文本都有 data-i18n 属性了\n');

process.exit(0);

