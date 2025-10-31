#!/usr/bin/env node
/**
 * 添加 Ecosystem 区域的完整描述翻译
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const newTranslations = {
  zh: {
    feature3DescFull: "每次参与都有链上记录。铸造 POAP、每日签到、领取 $QI — 守护文化的每一步，都被永久铭刻",
    feature4DescFull: "文化的未来，由全球决定。提案、投票、执行 — 每一票都有力量，每个人都是守护者"
  },
  en: {
    feature3DescFull: "Every participation is recorded on-chain. Mint POAP, daily check-in, claim $QI — every step of protecting culture is permanently inscribed",
    feature4DescFull: "The future of culture, decided globally. Propose, vote, execute — every vote has power, everyone is a guardian"
  },
  ja: {
    feature3DescFull: "すべての参加がチェーン上に記録されます。POAPを鋳造、毎日チェックイン、$QIを受け取る — 文化を守るすべてのステップが永久に刻まれます",
    feature4DescFull: "文化の未来は、世界中で決定されます。提案、投票、実行 — すべての票に力があり、誰もが守護者です"
  },
  fr: {
    feature3DescFull: "Chaque participation est enregistrée on-chain. Frapper POAP, enregistrement quotidien, réclamer $QI — chaque étape de protection de la culture est inscrite de façon permanente",
    feature4DescFull: "L'avenir de la culture, décidé mondialement. Proposer, voter, exécuter — chaque vote a du pouvoir, chacun est un gardien"
  },
  es: {
    feature3DescFull: "Cada participación se registra en la cadena. Acuñar POAP, registro diario, reclamar $QI — cada paso de proteger la cultura se inscribe permanentemente",
    feature4DescFull: "El futuro de la cultura, decidido globalmente. Proponer, votar, ejecutar — cada voto tiene poder, todos son guardianes"
  },
  ru: {
    feature3DescFull: "Каждое участие записывается в блокчейн. Чеканить POAP, ежедневная регистрация, получать $QI — каждый шаг защиты культуры навсегда записан",
    feature4DescFull: "Будущее культуры решается глобально. Предлагать, голосовать, исполнять — каждый голос имеет силу, каждый является хранителем"
  },
  ms: {
    feature3DescFull: "Setiap penyertaan direkodkan di rantaian. Cetak POAP, daftar masuk harian, tuntut $QI — setiap langkah melindungi budaya terukir secara kekal",
    feature4DescFull: "Masa depan budaya, diputuskan secara global. Cadang, undi, laksana — setiap undi mempunyai kuasa, semua orang adalah penjaga"
  }
};

const locales = ['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'];

locales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!data.homepage) data.homepage = {};
  if (!data.homepage.ecosystem) data.homepage.ecosystem = {};
  
  Object.assign(data.homepage.ecosystem, newTranslations[locale]);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有语言包已更新！');
console.log('新增: 2 个键 × 7 种语言 = 14 条翻译\n');

process.exit(0);

