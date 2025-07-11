// test/utils/test-db-helper.ts

import { db } from '@server/config/database';
import { resolve } from 'path';
import { existsSync, unlinkSync } from 'fs';

// 测试数据库路径
const TEST_DB_PATH = resolve(__dirname, '../../database/test-database.sqlite');

/**
 * 测试数据库辅助类
 */
export const TestDbHelper = {
  /**
   * 连接到测试数据库
   */
  async connect(): Promise<void> {
    // 如果测试数据库文件存在，则尝试删除它
    if (existsSync(TEST_DB_PATH)) {
      try {
        unlinkSync(TEST_DB_PATH);
      } catch (error) {
        console.warn('无法删除测试数据库文件，可能正在被使用:', error);
        // 继续执行，尝试重用现有数据库
      }
    }
    
    // 连接到测试数据库
    await db.connect(TEST_DB_PATH);
    
    // 初始化表结构
    await this.createTables();
  },
  
  /**
   * 创建所有表
   */
  async createTables(): Promise<void> {
    // 创建用户表
    await db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      note_structure TEXT
    )`);
    
    // 创建TODO表
    await db.run(`CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME NOT NULL,
      ddl DATETIME,
      priority INTEGER NOT NULL,
      tags TEXT,
      note_link TEXT,
      completed TEXT CHECK(completed IN ('completed', 'in-progress', 'not-started', 'pending')) DEFAULT 'not-started',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    
    // 创建笔记表
    await db.run(`CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
  },
  
  /**
   * 清空所有表
   */
  async clearTables(): Promise<void> {
    await db.run('DELETE FROM todos');
    await db.run('DELETE FROM notes');
    await db.run('DELETE FROM users');
  },
  
  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    await db.close();
  }
};
