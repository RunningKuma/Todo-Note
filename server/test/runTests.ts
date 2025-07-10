// test/runTests.ts

import { TestDbHelper } from './utils/test-db-helper';

// 设置环境变量
process.env.NODE_ENV = 'test';

async function setupAndRunTests() {
  try {
    console.log('=== 开始测试环境设置 ===');
    
    // 连接到测试数据库
    await TestDbHelper.connect();
    console.log('✅ 测试数据库连接成功');
    
    // 运行Jest测试
    console.log('🧪 开始运行测试...');
    
    // 测试结束后的操作
    process.on('exit', async () => {
      await cleanupTests();
    });
    
    // 捕获ctrl+c
    process.on('SIGINT', async () => {
      await cleanupTests();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ 测试环境设置失败:', error);
    process.exit(1);
  }
}

async function cleanupTests() {
  try {
    console.log('🧹 清理测试环境...');
    await TestDbHelper.close();
    console.log('✅ 测试环境清理完成');
  } catch (error) {
    console.error('❌ 测试环境清理失败:', error);
  }
}

// 运行测试
setupAndRunTests();
