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
   * 初始化数据库连接
   */
  async connect() {
    try {
      this.db = new sqlite3.Database('@/database/todo.db', (err) => {
        if (err) {
          console.error('数据库连接失败:', err);
          throw err;
        }
        console.log('数据库连接成功');
      });
    } catch (error) {
      console.error('数据库连接失败:', error);
      throw error;
    }
  }

  /**
   * 执行查询并返回多行结果
   */
  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('数据库未连接');
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
  async queryOne<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (!this.db) {
      throw new Error('数据库未连接');
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
  async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * 开始事务
   */
  async beginTransaction(): Promise<void> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }
    await this.db.run('BEGIN TRANSACTION');
  }

  /**
   * 提交事务
   */
  async commit(): Promise<void> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }
    await this.db.run('COMMIT');
  }

  /**
   * 回滚事务
   */
  async rollback(): Promise<void> {
    if (!this.db) {
      throw new Error('数据库未连接');
    }
    await this.db.run('ROLLBACK');
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