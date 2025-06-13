import { Request, Response } from 'express';
import { Note, NoteData } from '../models/note';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class NoteController {
  /**
   * 获取用户的所有笔记
   */
  public getNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const notes = await Note.findByUserId(userId);
      res.status(200).json({
        success: true,
        data: notes,
        message: '获取笔记列表成功'
      });
    } catch (error) {
      console.error('Error getting notes:', error);
      res.status(500).json({
        success: false,
        message: '获取笔记列表失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 创建新笔记
   */
  public createNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { title, content, category, tags, is_favorite = false } = req.body;

      if (!title || title.trim() === '') {
        res.status(400).json({ success: false, message: '笔记标题不能为空' });
        return;
      }

      const noteData: Omit<NoteData, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        title: title.trim(),
        content: content?.trim(),
        category: category?.trim(),
        tags: Array.isArray(tags) ? tags : [],
        is_favorite
      };

      const note = await Note.create(noteData);
      res.status(201).json({
        success: true,
        data: note,
        message: '笔记创建成功'
      });
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({
        success: false,
        message: '创建笔记失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 获取单个笔记
   */
  public getNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        res.status(400).json({ success: false, message: '无效的笔记ID' });
        return;
      }

      const note = await Note.findById(noteId);
      if (!note) {
        res.status(404).json({ success: false, message: '笔记不存在' });
        return;
      }

      if (note.user_id !== userId) {
        res.status(403).json({ success: false, message: '无权限访问此笔记' });
        return;
      }

      res.status(200).json({
        success: true,
        data: note,
        message: '获取笔记成功'
      });
    } catch (error) {
      console.error('Error getting note:', error);
      res.status(500).json({
        success: false,
        message: '获取笔记失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 更新笔记
   */
  public updateNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        res.status(400).json({ success: false, message: '无效的笔记ID' });
        return;
      }

      // 检查笔记是否存在且属于当前用户
      const existingNote = await Note.findById(noteId);
      if (!existingNote) {
        res.status(404).json({ success: false, message: '笔记不存在' });
        return;
      }

      if (existingNote.user_id !== userId) {
        res.status(403).json({ success: false, message: '无权限访问此笔记' });
        return;
      }

      const { title, content, category, tags, is_favorite } = req.body;
      const updateData: Partial<NoteData> = {};

      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content?.trim();
      if (category !== undefined) updateData.category = category?.trim();
      if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
      if (is_favorite !== undefined) updateData.is_favorite = is_favorite;

      const updatedNote = await Note.update(noteId, updateData);
      res.status(200).json({
        success: true,
        data: updatedNote,
        message: '笔记更新成功'
      });
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({
        success: false,
        message: '更新笔记失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 删除笔记
   */
  public deleteNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        res.status(400).json({ success: false, message: '无效的笔记ID' });
        return;
      }

      // 检查笔记是否存在且属于当前用户
      const existingNote = await Note.findById(noteId);
      if (!existingNote) {
        res.status(404).json({ success: false, message: '笔记不存在' });
        return;
      }

      if (existingNote.user_id !== userId) {
        res.status(403).json({ success: false, message: '无权限访问此笔记' });
        return;
      }

      await Note.delete(noteId);
      res.status(200).json({
        success: true,
        message: '笔记删除成功'
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({
        success: false,
        message: '删除笔记失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 切换笔记收藏状态
   */
  public toggleFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        res.status(400).json({ success: false, message: '无效的笔记ID' });
        return;
      }

      // 检查笔记是否存在且属于当前用户
      const existingNote = await Note.findById(noteId);
      if (!existingNote) {
        res.status(404).json({ success: false, message: '笔记不存在' });
        return;
      }

      if (existingNote.user_id !== userId) {
        res.status(403).json({ success: false, message: '无权限访问此笔记' });
        return;
      }

      const updatedNote = await Note.toggleFavorite(noteId);
      res.status(200).json({
        success: true,
        data: updatedNote,
        message: '笔记收藏状态更新成功'
      });
    } catch (error) {
      console.error('Error toggling note favorite:', error);
      res.status(500).json({
        success: false,
        message: '更新笔记收藏状态失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 搜索笔记
   */
  public searchNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { q: query } = req.query;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ success: false, message: '搜索关键词不能为空' });
        return;
      }

      const notes = await Note.search(userId, query);
      res.status(200).json({
        success: true,
        data: notes,
        message: `搜索到 ${notes.length} 条笔记`
      });
    } catch (error) {
      console.error('Error searching notes:', error);
      res.status(500).json({
        success: false,
        message: '搜索笔记失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 获取收藏的笔记
   */
  public getFavoriteNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const notes = await Note.findFavorites(userId);
      res.status(200).json({
        success: true,
        data: notes,
        message: '获取收藏笔记成功'
      });
    } catch (error) {
      console.error('Error getting favorite notes:', error);
      res.status(500).json({
        success: false,
        message: '获取收藏笔记失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 按分类获取笔记
   */
  public getNotesByCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { category } = req.params;
      if (!category) {
        res.status(400).json({ success: false, message: '分类名称不能为空' });
        return;
      }

      const notes = await Note.findByCategory(userId, category);
      res.status(200).json({
        success: true,
        data: notes,
        message: `获取分类"${category}"的笔记成功`
      });
    } catch (error) {
      console.error('Error getting notes by category:', error);
      res.status(500).json({
        success: false,
        message: '获取分类笔记失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 按标签获取笔记
   */
  public getNotesByTag = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { tag } = req.params;
      if (!tag) {
        res.status(400).json({ success: false, message: '标签名称不能为空' });
        return;
      }

      const notes = await Note.findByTag(userId, tag);
      res.status(200).json({
        success: true,
        data: notes,
        message: `获取标签"${tag}"的笔记成功`
      });
    } catch (error) {
      console.error('Error getting notes by tag:', error);
      res.status(500).json({
        success: false,
        message: '获取标签笔记失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 获取所有分类
   */
  public getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const categories = await Note.getCategories(userId);
      res.status(200).json({
        success: true,
        data: categories,
        message: '获取分类列表成功'
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: '获取分类列表失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 获取所有标签
   */
  public getTags = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const tags = await Note.getTags(userId);
      res.status(200).json({
        success: true,
        data: tags,
        message: '获取标签列表成功'
      });
    } catch (error) {
      console.error('Error getting tags:', error);
      res.status(500).json({
        success: false,
        message: '获取标签列表失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
