#!/usr/bin/env node

// 测试 Google Auth 配置
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// 解析环境变量
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

console.log('🔐 Google OAuth 配置检查:\n');

const googleId = envVars.AUTH_GOOGLE_ID;
const googleSecret = envVars.AUTH_GOOGLE_SECRET;
const googleEnabled = envVars.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED;

console.log(`✅ AUTH_GOOGLE_ID: ${googleId ? googleId.substring(0, 30) + '...' : '❌ 未设置'}`);
console.log(`✅ AUTH_GOOGLE_SECRET: ${googleSecret ? googleSecret.substring(0, 20) + '...' : '❌ 未设置'}`);
console.log(`✅ NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: ${googleEnabled}`);

console.log('\n' + '='.repeat(50) + '\n');

if (googleId && googleSecret && googleEnabled === 'true') {
  console.log('✅ Google OAuth 配置完整\n');
  console.log('📝 请确保在 Google Cloud Console 中配置了回调 URL:');
  console.log('   http://localhost:3006/api/auth/callback/google\n');
} else {
  console.log('⚠️  Google OAuth 配置不完整\n');
}
