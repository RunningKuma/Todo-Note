import { db } from '@server/config/database';

export interface NoteData {
  id?: number;
  user_id: string;
  title: string;
  content?: string;
  category?: string;
  tags?: string[]; // 标签数组
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

export const Note = {
  /**
   * 创建新的笔记
   */
  async create(noteData: Omit<NoteData, 'id' | 'created_at' | 'updated_at'>): Promise<NoteData> {
    try {
      const tagsJson = noteData.tags ? JSON.stringify(noteData.tags) : null;
      
      const result = await db.run(
        `INSERT INTO notes (user_id, title, content, category, tags, is_favorite, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          noteData.user_id,
          noteData.title,
          noteData.content || null,
          noteData.category || null,
          tagsJson,
          noteData.is_favorite ? 1 : 0
        ]
      );

      // 返回创建的笔记
      const created = await db.queryOne<any>(
        'SELECT * FROM notes WHERE id = ?',
        [result]
      );

      if (!created) {
        throw new Error('Failed to retrieve created note');
      }

      // 解析tags JSON
      return {
        ...created,
        tags: created.tags ? JSON.parse(created.tags) : []
      };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  /**
   * 获取用户的所有笔记
   */
  async findByUserId(userId: string): Promise<NoteData[]> {
    try {
      const notes = await db.query<any>(
        'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
      
      // 解析tags JSON
      return notes.map(note => ({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : []
      }));
    } catch (error) {
      console.error('Error finding notes by user ID:', error);
      throw error;
    }
  },

  /**
   * 根据ID获取笔记
   */
  async findById(id: number): Promise<NoteData | null> {
    try {
      const note = await db.queryOne<any>(
        'SELECT * FROM notes WHERE id = ?',
        [id]
      );
      
      if (!note) return null;
      
      // 解析tags JSON
      return {
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : []
      };
    } catch (error) {
      console.error('Error finding note by ID:', error);
      throw error;
    }
  },

  /**
   * 更新笔记
   */
  async update(id: number, noteData: Partial<NoteData>): Promise<NoteData> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (noteData.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(noteData.title);
      }
      if (noteData.content !== undefined) {
        updateFields.push('content = ?');
        updateValues.push(noteData.content);
      }
      if (noteData.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(noteData.category);
      }
      if (noteData.tags !== undefined) {
        updateFields.push('tags = ?');
        updateValues.push(JSON.stringify(noteData.tags));
      }
      if (noteData.is_favorite !== undefined) {
        updateFields.push('is_favorite = ?');
        updateValues.push(noteData.is_favorite ? 1 : 0);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await db.run(
        `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      const updated = await this.findById(id);
      if (!updated) {
        throw new Error('Note not found after update');
      }

      return updated;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  /**
   * 删除笔记
   */
  async delete(id: number): Promise<boolean> {
    try {
      await db.run('DELETE FROM notes WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  /**
   * 切换笔记收藏状态
   */
  async toggleFavorite(id: number): Promise<NoteData> {
    try {
      const note = await this.findById(id);
      if (!note) {
        throw new Error('Note not found');
      }

      return await this.update(id, { is_favorite: !note.is_favorite });
    } catch (error) {
      console.error('Error toggling note favorite:', error);
      throw error;
    }
  },

  /**
   * 按分类获取笔记
   */
  async findByCategory(userId: string, category: string): Promise<NoteData[]> {
    try {
      const notes = await db.query<any>(
        'SELECT * FROM notes WHERE user_id = ? AND category = ? ORDER BY updated_at DESC',
        [userId, category]
      );
      
      return notes.map(note => ({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : []
      }));
    } catch (error) {
      console.error('Error finding notes by category:', error);
      throw error;
    }
  },

  /**
   * 按标签获取笔记
   */
  async findByTag(userId: string, tag: string): Promise<NoteData[]> {
    try {
      const notes = await db.query<any>(
        `SELECT * FROM notes WHERE user_id = ? AND tags LIKE ? ORDER BY updated_at DESC`,
        [userId, `%"${tag}"%`]
      );
      
      return notes.map(note => ({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : []
      }));
    } catch (error) {
      console.error('Error finding notes by tag:', error);
      throw error;
    }
  },

  /**
   * 获取收藏的笔记
   */
  async findFavorites(userId: string): Promise<NoteData[]> {
    try {
      const notes = await db.query<any>(
        'SELECT * FROM notes WHERE user_id = ? AND is_favorite = 1 ORDER BY updated_at DESC',
        [userId]
      );
      
      return notes.map(note => ({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : []
      }));
    } catch (error) {
      console.error('Error finding favorite notes:', error);
      throw error;
    }
  },

  /**
   * 搜索笔记（按标题和内容）
   */
  async search(userId: string, query: string): Promise<NoteData[]> {
    try {
      const searchTerm = `%${query}%`;
      const notes = await db.query<any>(
        `SELECT * FROM notes 
         WHERE user_id = ? AND (title LIKE ? OR content LIKE ?) 
         ORDER BY updated_at DESC`,
        [userId, searchTerm, searchTerm]
      );
      
      return notes.map(note => ({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : []
      }));
    } catch (error) {
      console.error('Error searching notes:', error);
      throw error;
    }
  },

  /**
   * 获取所有分类
   */
  async getCategories(userId: string): Promise<string[]> {
    try {
      const categories = await db.query<{ category: string }>(
        'SELECT DISTINCT category FROM notes WHERE user_id = ? AND category IS NOT NULL',
        [userId]
      );
      
      return categories.map(row => row.category);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  /**
   * 获取所有标签
   */
  async getTags(userId: string): Promise<string[]> {
    try {
      const notes = await db.query<{ tags: string }>(
        'SELECT tags FROM notes WHERE user_id = ? AND tags IS NOT NULL',
        [userId]
      );
      
      const allTags = new Set<string>();
      notes.forEach(note => {
        if (note.tags) {
          const tags = JSON.parse(note.tags);
          tags.forEach((tag: string) => allTags.add(tag));
        }
      });
      
      return Array.from(allTags);
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  }
};
