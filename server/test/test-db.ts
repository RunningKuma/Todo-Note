// 测试数据库连接和创建功能
import { db } from '../src/config/database';

async function testDatabaseConnection() {
  try {
    console.log('=== 数据库连接测试开始 ===');
    
    // 测试连接
    await db.connect();
    console.log('✅ 数据库连接测试成功');
    
    // 测试查询
    const result = await db.query('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('📋 数据库表列表:', result);
    
    // 测试用户表结构
    const userTableInfo = await db.query('PRAGMA table_info(users)');
    console.log('👤 用户表结构:', userTableInfo);
    
    // 测试TODO表结构
    const todoTableInfo = await db.query('PRAGMA table_info(todos)');
    console.log('📝 TODO表结构:', todoTableInfo);
    
    // 测试笔记表结构
    const noteTableInfo = await db.query('PRAGMA table_info(notes)');
    console.log('📄 笔记表结构:', noteTableInfo);
    
    console.log('=== 数据库连接测试完成 ===');
    
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
  } finally {
    await db.close();
  }
}

// 运行测试
testDatabaseConnection();
