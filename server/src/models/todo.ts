import { db } from '@server/config/database';

export interface TodoData {
  id?: number;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export const Todo = {
  /**
   * 创建TODO表
   */
  createTable: (): void => {
    db.run(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      due_date TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
  },
  /**
   * 创建新的TODO
   */
  async create(todoData: Omit<TodoData, 'id' | 'created_at' | 'updated_at'>): Promise<TodoData> {
    try {
      const result = await db.execute(
        `INSERT INTO todos (user_id, title, description, completed, priority, due_date, category, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          todoData.user_id,
          todoData.title,
          todoData.description || null,
          todoData.completed ? 1 : 0,
          todoData.priority,
          todoData.due_date || null,
          todoData.category || null
        ]
      );

      // 返回创建的TODO
      const created = await db.queryOne<TodoData>(
        'SELECT * FROM todos WHERE id = ?',
        [result]
      );

      if (!created) {
        throw new Error('Failed to retrieve created todo');
      }

      return created;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  /**
   * 获取用户的所有TODO
   */
  async findByUserId(userId: string): Promise<TodoData[]> {
    try {
      const todos = await db.query<TodoData>(
        'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return todos;
    } catch (error) {
      console.error('Error finding todos by user ID:', error);
      throw error;
    }
  },

  /**
   * 根据ID获取TODO
   */
  async findById(id: number): Promise<TodoData | null> {
    try {
      const todo = await db.queryOne<TodoData>(
        'SELECT * FROM todos WHERE id = ?',
        [id]
      );
      return todo || null;
    } catch (error) {
      console.error('Error finding todo by ID:', error);
      throw error;
    }
  },

  /**
   * 更新TODO
   */
  async update(id: number, todoData: Partial<TodoData>): Promise<TodoData> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (todoData.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(todoData.title);
      }
      if (todoData.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(todoData.description);
      }
      if (todoData.completed !== undefined) {
        updateFields.push('completed = ?');
        updateValues.push(todoData.completed ? 1 : 0);
      }
      if (todoData.priority !== undefined) {
        updateFields.push('priority = ?');
        updateValues.push(todoData.priority);
      }
      if (todoData.due_date !== undefined) {
        updateFields.push('due_date = ?');
        updateValues.push(todoData.due_date);
      }
      if (todoData.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(todoData.category);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await db.run(
        `UPDATE todos SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      const updated = await db.queryOne<TodoData>(
        'SELECT * FROM todos WHERE id = ?',
        [id]
      );

      if (!updated) {
        throw new Error('Todo not found after update');
      }

      return updated;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  /**
   * 删除TODO
   */
  async delete(id: number): Promise<boolean> {
    try {
      await db.run('DELETE FROM todos WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  /**
   * 切换TODO完成状态
   */
  async toggleCompleted(id: number): Promise<TodoData> {
    try {
      const todo = await this.findById(id);
      if (!todo) {
        throw new Error('Todo not found');
      }

      return await this.update(id, { completed: !todo.completed });
    } catch (error) {
      console.error('Error toggling todo completion:', error);
      throw error;
    }
  },

  /**
   * 按分类获取TODO
   */
  async findByCategory(userId: string, category: string): Promise<TodoData[]> {
    try {
      const todos = await db.query<TodoData>(
        'SELECT * FROM todos WHERE user_id = ? AND category = ? ORDER BY created_at DESC',
        [userId, category]
      );
      return todos;
    } catch (error) {
      console.error('Error finding todos by category:', error);
      throw error;
    }
  },

  /**
   * 获取已完成的TODO
   */
  async findCompleted(userId: string): Promise<TodoData[]> {
    try {
      const todos = await db.query<TodoData>(
        'SELECT * FROM todos WHERE user_id = ? AND completed = 1 ORDER BY updated_at DESC',
        [userId]
      );
      return todos;
    } catch (error) {
      console.error('Error finding completed todos:', error);
      throw error;
    }
  },

  /**
   * 获取未完成的TODO
   */
  async findPending(userId: string): Promise<TodoData[]> {
    try {
      const todos = await db.query<TodoData>(
        'SELECT * FROM todos WHERE user_id = ? AND completed = 0 ORDER BY priority DESC, due_date ASC',
        [userId]
      );
      return todos;
    } catch (error) {
      console.error('Error finding pending todos:', error);
      throw error;
    }
  }
};
