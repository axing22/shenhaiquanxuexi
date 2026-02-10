// 测试 Vercel 环境变量
const testEnv = () => {
  console.log('=== 环境变量测试 ===');
  console.log('AUTH_GOOGLE_ID:', process.env.AUTH_GOOGLE_ID ? '✓ 已设置' : '✗ 未设置');
  console.log('AUTH_GOOGLE_SECRET:', process.env.AUTH_GOOGLE_SECRET ? '✓ 已设置' : '✗ 未设置');
  console.log('AUTH_SECRET:', process.env.AUTH_SECRET ? '✓ 已设置' : '✗ 未设置');
  console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID || '未设置');
  console.log('GOOGLE_LOCATION:', process.env.GOOGLE_LOCATION || '未设置');
  console.log('GOOGLE_CREDENTIALS:', process.env.GOOGLE_CREDENTIALS ? '✓ 已设置' : '✗ 未设置');
  
  if (process.env.AUTH_GOOGLE_ID) {
    console.log('\nAUTH_GOOGLE_ID 值:', process.env.AUTH_GOOGLE_ID);
  }
};

testEnv();
