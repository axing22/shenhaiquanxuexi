#!/usr/bin/env node

// 直接读取 .env 文件
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// 简单解析 .env 文件
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

console.log('🔍 环境变量检查:\n');

const checks = [
  { name: 'SUPABASE_URL', value: envVars.SUPABASE_URL },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: envVars.SUPABASE_SERVICE_ROLE_KEY },
  { name: 'AUTH_GOOGLE_ID', value: envVars.AUTH_GOOGLE_ID },
  { name: 'AUTH_GOOGLE_SECRET', value: envVars.AUTH_GOOGLE_SECRET },
  { name: 'AUTH_SECRET', value: envVars.AUTH_SECRET },
];

let allPassed = true;

checks.forEach(({ name, value }) => {
  const exists = !!value;
  const status = exists ? '✅' : '❌';
  const display = exists ? `${value.substring(0, 30)}...` : '未设置';
  console.log(`${status} ${name}: ${display}`);
  if (!exists && name.includes('SUPABASE')) {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50) + '\n');

if (allPassed) {
  console.log('✅ 所有必需的 Supabase 环境变量已设置');
  console.log('\n现在可以启动开发服务器:');
  console.log('  pnpm dev\n');
} else {
  console.log('❌ 缺少必需的环境变量');
  console.log('\n请检查 .env 文件\n');
  process.exit(1);
}
