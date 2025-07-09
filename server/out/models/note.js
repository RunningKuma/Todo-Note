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
exports.NoteClass = void 0;
const database_1 = require("@server/config/database");
exports.NoteClass = {
    /**
     * 创建笔记表
     */
    createTable: () => {
        database_1.db.run(`CREATE TABLE IF NOT EXISTS notes (
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
     * 1. 获取用户笔记目录结构
     * GET /folders
     */
    getFolders(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield database_1.db.queryOne('SELECT note_structure FROM users WHERE id = ?', [userId]);
                if (!user || !user.note_structure) {
                    return [];
                }
                return JSON.parse(user.note_structure);
            }
            catch (error) {
                console.error('Error getting folders:', error);
                throw error;
            }
        });
    },
    /**
     * 2. 更新用户笔记目录结构
     * POST /folders
     */
    updateFolders(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.db.run('UPDATE users SET note_structure = ? WHERE id = ?', [JSON.stringify(data), userId]);
                return true;
            }
            catch (error) {
                console.error('Error updating folders:', error);
                throw error;
            }
        });
    },
    /**
     * 3. 根据ID获取笔记
     * GET /:id
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const note = yield database_1.db.queryOne('SELECT * FROM notes WHERE id = ?', [id]);
                if (!note)
                    return null;
                return this.mapDbRowToNote(note);
            }
            catch (error) {
                console.error('Error finding note by ID:', error);
                throw error;
            }
        });
    },
    /**
     * 4. 创建新笔记
     * POST /
     */
    create(userId, noteMeta) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const noteId = crypto.randomUUID();
                const now = new Date().toISOString();
                const tagsJson = noteMeta.tags ? JSON.stringify(noteMeta.tags) : null;
                yield database_1.db.run(`INSERT INTO notes (id, user_id, title, content, tags, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                    noteId,
                    userId,
                    noteMeta.title,
                    '', // 创建时内容为空
                    tagsJson,
                    now,
                    now
                ]);
                return true;
            }
            catch (error) {
                console.error('Error creating note:', error);
                throw error;
            }
        });
    },
    /**
     * 5. 更新笔记
     * PUT /
     */
    update(note) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tagsJson = note.meta.tags ? JSON.stringify(note.meta.tags) : null;
                const now = new Date().toISOString();
                yield database_1.db.run(`UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = ? WHERE id = ?`, [
                    note.meta.title,
                    note.content,
                    tagsJson,
                    now,
                    note.meta.id
                ]);
                return true;
            }
            catch (error) {
                console.error('Error updating note:', error);
                throw error;
            }
        });
    },
    /**
     * 6. 删除笔记
     * DELETE /:id
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.db.run('DELETE FROM notes WHERE id = ?', [id]);
                return true;
            }
            catch (error) {
                console.error('Error deleting note:', error);
                throw error;
            }
        });
    },
    /**
     * 将数据库行映射为Note对象
     */
    mapDbRowToNote(row) {
        const meta = {
            id: row.id,
            title: row.title,
            create: new Date(row.created_at),
            modified: new Date(row.updated_at),
            tags: row.tags ? JSON.parse(row.tags) : undefined
        };
        return {
            meta,
            content: row.content
        };
    },
    /**
     * 辅助方法：获取用户的所有笔记（用于其他功能）
     */
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notes = yield database_1.db.query('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
                return notes.map(this.mapDbRowToNote);
            }
            catch (error) {
                console.error('Error finding notes by user ID:', error);
                throw error;
            }
        });
    }
};
