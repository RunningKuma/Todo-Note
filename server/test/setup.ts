// test/setup.ts - Jest全局设置文件

import { TestDbHelper } from './utils/test-db-helper';

// 测试前设置
beforeAll(async () => {
  // 连接到测试数据库
  await TestDbHelper.connect();
  
  // 设置Jest超时时间
  jest.setTimeout(10000);
});

// 每个测试后清理数据
afterEach(async () => {
  // 清空所有表数据
  await TestDbHelper.clearTables();
});

// 所有测试完成后关闭数据库连接
afterAll(async () => {
  await TestDbHelper.close();
});
