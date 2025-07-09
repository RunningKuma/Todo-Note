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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoModel = void 0;
const database_1 = require("@server/config/database");
const db_1 = require("@server/utils/db");
exports.TodoModel = {
    /**
     * 创建TODO表
     */
    createTable: () => {
        database_1.db.run(`CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME NOT NULL,
      ddl DATETIME,
      priority INTEGER NOT NULL,
      tags TEXT, -- JSON string of tags array
      note_link TEXT,
      completed TEXT CHECK(completed IN ('completed', 'in-progress', 'not-started', 'pending')) DEFAULT 'not-started',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    },
    /**
     * 创建新的TODO
     */
    create(todo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dbData = (0, db_1.todoToDb)(todo);
                const res = yield database_1.db.execute(`INSERT INTO todos (id, user_id, title, description, created_at, ddl, priority, tags, note_link, completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    dbData.id,
                    dbData.user_id,
                    dbData.title,
                    dbData.description || null,
                    dbData.created_at,
                    dbData.ddl || null,
                    dbData.priority,
                    dbData.tags || null,
                    dbData.note_link || null,
                    dbData.completed
                ]);
                if (!res) {
                    throw new Error('Failed to retrieve created todo');
                }
                return res;
            }
            catch (error) {
                console.error('Error creating todo:', error);
                throw error;
            }
        });
    },
    /**
     * 获取用户的所有TODO
     */
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const todos = yield database_1.db.query('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC', [userId]);
                return (0, db_1.batchDbToTodo)(todos);
            }
            catch (error) {
                console.error('Error finding todos by user ID:', error);
                throw error;
            }
        });
    },
    /**
     * 根据ID获取TODO
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const todo = yield database_1.db.queryOne('SELECT * FROM todos WHERE id = ?', [id]);
                return todo ? (0, db_1.dbToTodo)(todo) : null;
            }
            catch (error) {
                console.error('Error finding todo by ID:', error);
                throw error;
            }
        });
    },
    /**
     * 更新TODO
     */
    update(todo) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const updateFields = [];
                const updateValues = [];
                if (!todo.info)
                    return 0;
                if (todo.info.title) {
                    updateFields.push('title = ?');
                    updateValues.push(todo.info.title);
                }
                if (todo.info.description) {
                    updateFields.push('description = ?');
                    updateValues.push(todo.info.description);
                }
                if ((_a = todo.status) === null || _a === void 0 ? void 0 : _a.completed) {
                    updateFields.push('completed = ?');
                    updateValues.push(todo.status.completed);
                }
                if (todo.info.priority) {
                    updateFields.push('priority = ?');
                    updateValues.push(todo.info.priority);
                }
                if (todo.info.ddl) {
                    updateFields.push('ddl = ?');
                    updateValues.push(todo.info.ddl || null);
                }
                if (todo.info.tags) {
                    updateFields.push('tags = ?');
                    updateValues.push(todo.info.tags ? JSON.stringify(todo.info.tags) : null);
                }
                if (todo.info.note_link) {
                    updateFields.push('note_link = ?');
                    updateValues.push(todo.info.note_link);
                }
                if (updateFields.length === 0) {
                    throw new Error('No fields to update');
                }
                const res = yield database_1.db.execute(`UPDATE todos SET ${updateFields.join(', ')} WHERE id = ?`, [...updateValues, todo.info.id]);
                if (!res) {
                    throw new Error('Todo not found after update');
                }
                return res;
            }
            catch (error) {
                console.error('Error updating todo:', error);
                throw error;
            }
        });
    },
    /**
     * 删除TODO
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.db.run('DELETE FROM todos WHERE id = ?', [id]);
                return true;
            }
            catch (error) {
                console.error('Error deleting todo:', error);
                throw error;
            }
        });
    },
    /**
     * 切换TODO完成状态
     */
    toggleCompleted(id, complete) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const todo = yield this.findById(id);
                if (!todo) {
                    throw new Error('Todo not found');
                }
                const newStatus = complete ? 'completed' : 'not-started';
                // @ts-expect-error part of TodoInfo
                const response = yield this.update({ info: { id }, status: { completed: newStatus } });
                return response > 0 ? true : false;
            }
            catch (error) {
                console.error('Error toggling todo completion:', error);
                throw error;
            }
        });
    },
    // /**
    //  * 按标签获取TODO
    //  */
    // async findByTags(userId: UserId, tags: string[]): Promise<TodoRawData[]> {
    //   try {
    //     const todos = await db.query<TodoRawData>(
    //       'SELECT * FROM todos WHERE user_id = ? AND tags IS NOT NULL ORDER BY create DESC',
    //       [userId]
    //     );
    //     // 在应用层过滤标签，因为 SQLite 的 JSON 处理有限
    //     return todos.filter(todo => {
    //       if (!todo.tags) return false;
    //       try {
    //         const todoTags = JSON.parse(todo.tags);
    //         return tags.some(tag => todoTags.includes(tag));
    //       } catch {
    //         return false;
    //       }
    //     });
    //   } catch (error) {
    //     console.error('Error finding todos by tags:', error);
    //     throw error;
    //   }
    // },
    // /**
    //  * 获取已完成的TODO
    //  */
    // async findCompleted(userId: UserId): Promise<TodoRawData[]> {
    //   try {
    //     const todos = await db.query<TodoRawData>(
    //       'SELECT * FROM todos WHERE user_id = ? AND completed = "completed" ORDER BY create DESC',
    //       [userId]
    //     );
    //     return todos;
    //   } catch (error) {
    //     console.error('Error finding completed todos:', error);
    //     throw error;
    //   }
    // },
    // /**
    //  * 获取未完成的TODO
    //  */
    // async findPending(userId: UserId): Promise<TodoRawData[]> {
    //   try {
    //     const todos = await db.query<TodoRawData>(
    //       'SELECT * FROM todos WHERE user_id = ? AND completed != "completed" ORDER BY priority DESC, ddl ASC',
    //       [userId]
    //     );
    //     return todos;
    //   } catch (error) {
    //     console.error('Error finding pending todos:', error);
    //     throw error;
    //   }
    // }
};
