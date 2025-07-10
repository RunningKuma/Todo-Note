import { db } from '@server/config/database';
import { Note, NoteMeta, NoteTreeNode } from '@server/types/note';
import { NoteId, UserId } from '@server/types/gerneral';

export interface NoteDbRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string | null; // JSON字符串
  created_at: string;
  updated_at: string;
}

export interface UserDbRow {
  id: string;
  email: string;
  username: string;
  password: string;
  note_structure: string | null; // JSON字符串存储笔记目录结构
}

export const NoteClass = {
  /**
   * 创建笔记表
   */
  createTable: (): void => {
    db.run(`CREATE TABLE IF NOT EXISTS notes (
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
  async getFolders(userId: UserId): Promise<NoteTreeNode[]> {
    try {
      const user = await db.queryOne<UserDbRow>(
        'SELECT note_structure FROM users WHERE id = ?',
        [userId]
      );
      
      if (!user || !user.note_structure) {
        return [];
      }
      
      return JSON.parse(user.note_structure);
    } catch (error) {
      console.error('Error getting folders:', error);
      throw error;
    }
  },

  /**
   * 2. 更新用户笔记目录结构
   * POST /folders
   */
  async updateFolders(userId: UserId, data: NoteTreeNode[]): Promise<boolean> {
    try {
      await db.run(
        'UPDATE users SET note_structure = ? WHERE id = ?',
        [JSON.stringify(data), userId]
      );
      return true;
    } catch (error) {
      console.error('Error updating folders:', error);
      throw error;
    }
  },

  /**
   * 3. 根据ID获取笔记
   * GET /:id
   */
  async findById(id: NoteId): Promise<Note | null> {
    try {
      const note = await db.queryOne<NoteDbRow>(
        'SELECT * FROM notes WHERE id = ?',
        [id]
      );
      
      if (!note) return null;
      
      return this.mapDbRowToNote(note);
    } catch (error) {
      console.error('Error finding note by ID:', error);
      throw error;
    }
  },

  /**
   * 4. 创建新笔记
   * POST /
   */
  async create(userId: UserId, noteMeta: Omit<NoteMeta, 'create' | 'modified'>): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const tagsJson = noteMeta.tags ? JSON.stringify(noteMeta.tags) : null;
      
      await db.run(
        `INSERT INTO notes (id, user_id, title, content, tags, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          noteMeta.id, // 使用前端传递的id
          userId,
          noteMeta.title,
          '', // 创建时内容为空
          tagsJson,
          now,
          now
        ]
      );

      return true;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  /**
   * 5. 更新笔记
   * PUT /
   */
  async update(note: Note): Promise<boolean> {
    try {
      const tagsJson = note.meta.tags ? JSON.stringify(note.meta.tags) : null;
      const now = new Date().toISOString();
      const updateFields: string[] = [];
      const updateValues: (string | number | null)[] = [];

      if (note.meta.title) {
        updateFields.push('title = ?');
        updateValues.push(note.meta.title);
      }
      if (note.content) {
        updateFields.push('content = ?');
        updateValues.push(note.content);
      }
      if (note.meta.tags) {
        updateFields.push('tags = ?');
        updateValues.push(tagsJson);
      }
      if (note.meta.modified) {
        updateFields.push('updated_at = ?');
        updateValues.push(now);
      }

      await db.execute(
        `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ?`,
        [...updateValues, note.meta.id]
      );

      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  /**
   * 6. 删除笔记
   * DELETE /:id
   */
  async delete(id: NoteId): Promise<boolean> {
    try {
      await db.run('DELETE FROM notes WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  /**
   * 将数据库行映射为Note对象
   */
  mapDbRowToNote(row: NoteDbRow): Note {
    const meta: NoteMeta = {
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
  async findByUserId(userId: UserId): Promise<Note[]> {
    try {
      const notes = await db.query<NoteDbRow>(
        'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
      
      return notes.map(this.mapDbRowToNote);
    } catch (error) {
      console.error('Error finding notes by user ID:', error);
      throw error;
    }
  }
};

