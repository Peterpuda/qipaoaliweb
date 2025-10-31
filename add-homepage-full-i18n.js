#!/usr/bin/env node

/**
 * 为主页添加完整的多语言支持
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 为主页添加完整多语言支持...\n');

// 首先更新语言包，添加主页所有内容的翻译
const translations = {
  zh: {
    "homepage": {
      "title": "AI驱动的文化出海平台",
      "description": "融合AI智能与Web3技术，保护全球非遗文化，解锁·共创·流转 — 文旅不止于故事",
      "nav": {
        "platform": "平台",
        "token": "通证",
        "ecosystem": "生态系统",
        "governance": "治理",
        "admin": "管理员",
        "enter": "进入平台"
      },
      "hero": {
        "title": "文化出海",
        "subtitle": "当中国的非遗，与世界不同文化重新相遇",
        "videoLoading": "加载视频中..."
      },
      "platform": {
        "title": "文化裂变，用链与智构建新经济",
        "subtitle": "非遗不只是过去 — 而是未来的守望",
        "ai": {
          "title": "AI 匠人分身",
          "desc1": "与匠人 AI 对话，了解一针一线的故事。",
          "desc2": "传承不再是档案，而是有温度的交流",
          "cta": "与匠人对话"
        },
        "blockchain": {
          "title": "永久链上存储",
          "desc1": "工艺纹样、匠人档案、传世作品上链合约。",
          "desc2": "只要链在，价值就永续",
          "cta": "了解技术"
        },
        "nft": {
          "title": "NFT 真品凭证",
          "desc1": "每件作品都有唯一链上凭证。",
          "desc2": "假冒不可能，价值可信任",
          "cta": "查看凭证"
        }
      }
    }
  },
  en: {
    "homepage": {
      "title": "AI-Powered Cultural Globalization Platform",
      "description": "Integrating AI Intelligence and Web3 Technology to Preserve Global Intangible Cultural Heritage",
      "nav": {
        "platform": "Platform",
        "token": "Token",
        "ecosystem": "Ecosystem",
        "governance": "Governance",
        "admin": "Admin",
        "enter": "Enter Platform"
      },
      "hero": {
        "title": "Cultural Globalization",
        "subtitle": "When Chinese Intangible Heritage Meets World Cultures Anew",
        "videoLoading": "Loading video..."
      },
      "platform": {
        "title": "Cultural Innovation Through Blockchain and AI",
        "subtitle": "Heritage is not just the past — it's the guardian of our future",
        "ai": {
          "title": "AI Artisan Avatar",
          "desc1": "Converse with AI artisans, learn the story behind every stitch.",
          "desc2": "Heritage is no longer archived, but a warm conversation",
          "cta": "Talk to Artisans"
        },
        "blockchain": {
          "title": "Permanent On-Chain Storage",
          "desc1": "Craft patterns, artisan archives, masterpieces on blockchain.",
          "desc2": "As long as the chain exists, value persists",
          "cta": "Learn Technology"
        },
        "nft": {
          "title": "NFT Authenticity Certificate",
          "desc1": "Every piece has a unique on-chain certificate.",
          "desc2": "Counterfeiting impossible, value trustworthy",
          "cta": "View Certificates"
        }
      }
    }
  }
};

// 更新中文和英文语言包
['zh', 'en'].forEach(lang => {
  const filePath = path.join(__dirname, `frontend/i18n/locales/${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // 合并新的翻译
  content.homepage = { ...content.homepage, ...translations[lang].homepage };
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
  console.log(`✅ ${lang}.json 已更新`);
});

console.log('\n🎉 语言包更新完成！');
console.log('\n📝 接下来需要手动添加 data-i18n 属性到 HTML 元素');

