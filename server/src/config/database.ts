import { resolve } from 'path';
import { existsSync } from 'fs';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

class DatabaseService {
  private db: Database | null = null;
  private static instance: DatabaseService;

  private constructor() { }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }


  /**
   * 检查数据库文件是否存在
   */
  private checkDatabaseExists(dbPath: string): boolean {
    return existsSync(dbPath);
  }

  /**
   * 初始化数据库表结构
   */
  private async initializeTables(): Promise<void> {
    try {

      // 创建用户表
      await this.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        note_structure TEXT
      )`);

      // 创建TODO表
      await this.run(`CREATE TABLE IF NOT EXISTS todos (
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
      await this.run(`CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // 创建索引以提高查询性能
      await this.run('CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)');

      console.log('✓ 数据库表结构初始化完成');
    } catch (error) {
      console.error('❌ 初始化数据库表结构失败:', error);
      throw error;
    }
  }

  /**
   * 初始化数据库连接
   * 如果数据库不存在会自动创建
   */
  async connect(path: string = resolve(__dirname, '../../database/database.sqlite')): Promise<void> {
    try {
      console.log('正在连接数据库...');

      // 检查数据库文件是否存在
      const isNewDatabase = !this.checkDatabaseExists(path);
      if (isNewDatabase) {
        console.log(`🆕 数据库文件不存在，将创建新的数据库: ${path}`);
      } else {
        console.log(`📁 发现现有数据库文件: ${path}`);
      }

      // 创建数据库连接
      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(path, async (err) => {
          if (err) {
            console.error('❌ 数据库连接失败:', err);
            reject(err);
          } else {
            console.log('✅ 数据库连接成功');

            try {
              // 初始化表结构（对于新数据库和现有数据库都执行）
              await this.initializeTables();

              if (isNewDatabase) {
                console.log('🎉 新数据库创建并初始化完成');
              } else {
                console.log('🔄 现有数据库表结构检查完成');
              }

              resolve();
            } catch (initError) {
              console.error('❌ 数据库初始化失败:', initError);
              reject(initError);
            }
          }
        });
      });
    } catch (error) {
      console.error('❌ 数据库连接过程失败:', error);
      throw error;
    }
  }

  /**
   * 执行 SQL 语句
   * @param sql SQL 语句
   * @param params 参数数组
   */
  async run(sql: string, params: (string | number | null)[] = []): Promise<void> {
    if (!this.db) {
      await this.connect();
    }
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 执行查询并返回多行结果
   */
  async query<T>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
    if (!this.db) {
      await this.connect();
    }
    return new Promise((resolve, reject) => {
      this.db!.all<T>(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * 执行查询并返回单行结果
   */
  async queryOne<T>(sql: string, params: (string | number | null)[] = []): Promise<T | undefined> {
    if (!this.db) {
      await this.connect();
    }
    return new Promise((resolve, reject) => {
      this.db!.get<T>(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  /**
   * 执行更新操作
   */
  async execute(sql: string, params: (string | number | null)[] = []): Promise<number> {
    if (!this.db) {
      await this.connect();
    }
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(1); // 返回受影响的行数
        }
      });
    });
  }

  /**
   * 开始事务
   */
  async beginTransaction(): Promise<void> {
    if (!this.db) {
      await this.connect();
    }
    await this.run('BEGIN TRANSACTION');
  }

  /**
   * 提交事务
   */
  async commit(): Promise<void> {
    if (!this.db) {
      await this.connect();
    }
    await this.run('COMMIT');
  }

  /**
   * 回滚事务
   */
  async rollback(): Promise<void> {
    if (!this.db) {
      await this.connect();
    }
    await this.run('ROLLBACK');
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// 导出单例实例
export const db = DatabaseService.getInstance();