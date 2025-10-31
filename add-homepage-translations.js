#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const translations = {
  ja: {
    "homepage": {
      "nav": {
        "platform": "プラットフォーム",
        "token": "トークン",
        "ecosystem": "エコシステム",
        "governance": "ガバナンス",
        "admin": "管理者",
        "enter": "プラットフォームに入る"
      }
    }
  },
  fr: {
    "homepage": {
      "nav": {
        "platform": "Plateforme",
        "token": "Jeton",
        "ecosystem": "Écosystème",
        "governance": "Gouvernance",
        "admin": "Administrateur",
        "enter": "Entrer sur la Plateforme"
      }
    }
  },
  es: {
    "homepage": {
      "nav": {
        "platform": "Plataforma",
        "token": "Token",
        "ecosystem": "Ecosistema",
        "governance": "Gobernanza",
        "admin": "Administrador",
        "enter": "Entrar a la Plataforma"
      }
    }
  },
  ru: {
    "homepage": {
      "nav": {
        "platform": "Платформа",
        "token": "Токен",
        "ecosystem": "Экосистема",
        "governance": "Управление",
        "admin": "Администратор",
        "enter": "Войти на Платформу"
      }
    }
  },
  ms: {
    "homepage": {
      "nav": {
        "platform": "Platform",
        "token": "Token",
        "ecosystem": "Ekosistem",
        "governance": "Tadbir Urus",
        "admin": "Pentadbir",
        "enter": "Masuk ke Platform"
      }
    }
  }
};

console.log('🌐 添加主页翻译到所有语言包...\n');

Object.keys(translations).forEach(lang => {
  const filePath = path.join(__dirname, `frontend/i18n/locales/${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  content.homepage = translations[lang].homepage;
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
  console.log(`✅ ${lang}.json 已更新`);
});

console.log('\n🎉 所有语言包已更新！');

