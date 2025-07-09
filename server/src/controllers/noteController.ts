import { Request, Response } from 'express';
import { NoteClass } from '../models/note';
import { NoteMeta, NoteTreeNode } from '../types/note';
import { NoteService } from '../services/noteService';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class NoteController {
  private noteService: NoteService;

  constructor() {
    this.noteService = new NoteService();
  }

  /**
   * 1. 获取用户笔记目录结构
   * GET /folders
   */
  public getFolders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const folders = await NoteClass.getFolders(userId);
      res.status(200).json({
        success: true,
        data: folders
      });
    } catch (error) {
      console.error('Error getting folders:', error);
      res.status(500).json({
        success: false,
        message: '获取笔记目录结构失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 2. 更新用户笔记目录结构
   * POST /folders
   */
  public updateFolders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      //@todo 需要添加先验证用户存在的检查😂
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { data }: { data: NoteTreeNode[] } = req.body;
      if (!data) {
        res.status(400).json({ success: false, message: '请提供笔记目录结构数据' });
        return;
      }

      const success = await NoteClass.updateFolders(userId, data);
      res.status(200).json({
        success
      });
    } catch (error) {
      console.error('Error updating folders:', error);
      res.status(500).json({
        success: false,
        message: '更新笔记目录结构失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 3. 根据ID获取笔记
   * GET /:id
   */
  public getNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const noteId = req.params.id;
      if (!noteId) {
        res.status(400).json({ success: false, message: '笔记ID不能为空' });
        return;
      }

      const note = await NoteClass.findById(noteId);
      if (!note) {
        res.status(404).json({ success: false, message: '笔记不存在' });
        return;
      }

      res.status(200).json({
        success: true,
        data: note
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
   * 4. 创建新笔记
   * POST /
   */
  public createNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const noteMeta: Omit<NoteMeta, 'id' | 'create' | 'modified'> = req.body;
      if (!noteMeta.title || noteMeta.title.trim() === '') {
        res.status(400).json({ success: false, message: '笔记标题不能为空' });
        return;
      }

      const success = await NoteClass.create(userId, noteMeta);
      res.status(201).json({
        success
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
   * 5. 更新笔记
   * PUT /
   */
  public updateNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const note = req.body;
      if (!note || !note.meta || !note.meta.id) {
        res.status(400).json({ success: false, message: '请提供完整的笔记数据' });
        return;
      }

      // 验证笔记是否存在
      const existingNote = await NoteClass.findById(note.meta.id);
      if (!existingNote) {
        res.status(404).json({ success: false, message: '笔记不存在' });
        return;
      }

      const success = await NoteClass.update(note);
      res.status(200).json({
        success
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
   * 6. 删除笔记
   * DELETE /:id
   */
  public deleteNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const noteId = req.params.id;
      if (!noteId) {
        res.status(400).json({ success: false, message: '笔记ID不能为空' });
        return;
      }

      // 验证笔记是否存在
      const existingNote = await NoteClass.findById(noteId);
      if (!existingNote) {
        res.status(404).json({ success: false, message: '笔记不存在' });
        return;
      }

      const success = await NoteClass.delete(noteId);
      res.status(200).json({
        success
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
   * 创建笔记文件夹 (保留此方法以备后用)
   */
  public createNoteFolder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { name } = req.body;
      if (!name || name.trim() === '') {
        res.status(400).json({ success: false, message: '文件夹名称不能为空' });
        return;
      }

      // 这里可以添加创建文件夹的逻辑
      // 由于现在使用树形结构存储在用户表中，这个方法可能需要重新设计
      res.status(501).json({
        success: false,
        message: '此功能暂时不可用，请使用目录结构更新接口'
      });
    } catch (error) {
      console.error('Error creating note folder:', error);
      res.status(500).json({
        success: false,
        message: '创建笔记文件夹失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
