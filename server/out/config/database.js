"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const path_1 = require("path");
const sqlite3_1 = __importDefault(require("sqlite3"));
class DatabaseService {
    constructor() {
        this.db = null;
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    /**
     * 初始化数据库连接
     */
    connect() {
        return __awaiter(this, arguments, void 0, function* (path = (0, path_1.resolve)(__dirname, '../../database/database.sqlite')) {
            try {
                this.db = new sqlite3_1.default.Database(path, (err) => {
                    //@todo fix 两次连接
                    if (err) {
                        console.error('数据库连接失败:', err);
                        throw err;
                    }
                    console.log('数据库 ' + path + ' 连接成功');
                });
            }
            catch (error) {
                console.error('数据库连接失败:', error);
                throw error;
            }
        });
    }
    /**
     * 执行 SQL 语句
     * @param sql SQL 语句
     * @param params 参数数组
     */
    run(sql_1) {
        return __awaiter(this, arguments, void 0, function* (sql, params = []) {
            if (!this.db) {
                this.connect();
            }
            return new Promise((resolve, reject) => {
                this.db.run(sql, params, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * 执行查询并返回多行结果
     */
    query(sql_1) {
        return __awaiter(this, arguments, void 0, function* (sql, params = []) {
            if (!this.db) {
                this.connect();
            }
            return new Promise((resolve, reject) => {
                this.db.all(sql, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    /**
     * 执行查询并返回单行结果
     */
    queryOne(sql_1) {
        return __awaiter(this, arguments, void 0, function* (sql, params = []) {
            if (!this.db) {
                this.connect();
            }
            return new Promise((resolve, reject) => {
                this.db.get(sql, params, (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(row);
                    }
                });
            });
        });
    }
    /**
     * 执行更新操作
     */
    execute(sql_1) {
        return __awaiter(this, arguments, void 0, function* (sql, params = []) {
            if (!this.db) {
                yield this.connect();
            }
            return new Promise((resolve, reject) => {
                this.db.run(sql, params, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.lastID);
                    }
                });
            });
        });
    }
    /**
     * 开始事务
     */
    //@todo ？这些是干什么的？
    beginTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db) {
                this.connect();
            }
            yield this.db.run('BEGIN TRANSACTION');
        });
    }
    /**
     * 提交事务
     */
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db) {
                this.connect();
            }
            yield this.db.run('COMMIT');
        });
    }
    /**
     * 回滚事务
     */
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db) {
                this.connect();
            }
            yield this.db.run('ROLLBACK');
        });
    }
    /**
      }
      await this.db.run('ROLLBACK');
    }
  
    /**
     * 关闭数据库连接
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.db) {
                yield this.db.close();
                this.db = null;
            }
        });
    }
}
// 导出单例实例
exports.db = DatabaseService.getInstance();
