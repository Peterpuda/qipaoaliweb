const fs = require('fs');
const path = require('path');

// 定义各语言的"铭刻参与"翻译
const translations = {
  ja: "参加を刻む",           // 日语：参加を刻む
  fr: "Inscrire la Participation", // 法语
  es: "Inscribir Participación",   // 西班牙语
  ru: "Записать Участие",          // 俄语
  ms: "Catat Penyertaan"           // 马来语
};

const localesDir = path.join(__dirname, 'frontend', 'i18n', 'locales');

Object.keys(translations).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // 更新 claimButton
    if (data.homepage && data.homepage.token) {
      data.homepage.token.claimButton = translations[lang];
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ 已更新 ${lang}.json: ${translations[lang]}`);
  } catch (error) {
    console.error(`❌ 更新 ${lang}.json 失败:`, error.message);
  }
});

console.log('\n🎉 所有语言的按钮文字已更新！');

