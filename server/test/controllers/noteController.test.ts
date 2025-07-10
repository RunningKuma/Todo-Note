// test/controllers/noteController.test.ts

import { NoteController } from '@server/controllers/noteController';
import { Response } from 'express';
import { AuthenticatedRequest } from '@server/middleware/auth';
import { randomUUID } from 'crypto';
import { Note, NoteMeta, NoteTreeNode } from '@server/types/note';

// 模拟NoteService
const mockNoteService = {
  getFolders: jest.fn(),
  updateFolders: jest.fn(),
  getNoteById: jest.fn(),
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  getRecentNotes: jest.fn()
};

jest.mock('@server/services/noteService', () => {
  return {
    NoteService: jest.fn().mockImplementation(() => mockNoteService)
  };
});

// 模拟请求和响应对象
const mockRequest = () => {
  const req: Partial<AuthenticatedRequest> = {};
  req.body = {};
  req.params = {};
  req.user = { id: randomUUID() };
  return req as AuthenticatedRequest;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('NoteController', () => {
  let noteController: NoteController;
  let userId: string;
  
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
    
    // 创建控制器实例
    noteController = new NoteController();
    
    // 创建测试用户ID
    userId = randomUUID();
  });
  
  describe('getFolders', () => {
    it('应该返回用户的笔记目录结构', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 模拟NoteService.getFolders方法返回值
      const mockFolders: NoteTreeNode[] = [
        { 
          key: 'folder1', 
          label: '文件夹1', 
          type: 'folder',
          selectable: true, 
          children: [
            { key: 'note1', label: '笔记1', type: 'note', selectable: true }
          ]
        }
      ];
      mockNoteService.getFolders.mockResolvedValue(mockFolders);
      
      // 调用控制器方法
      await noteController.getFolders(req, res);
      
      // 断言
      expect(mockNoteService.getFolders).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockFolders
        })
      );
    });
    
    it('应该在用户未授权时返回401', async () => {
      // 准备没有用户信息的请求
      const req = mockRequest();
      req.user = undefined; // 未授权
      const res = mockResponse();
      
      // 调用控制器方法
      await noteController.getFolders(req, res);
      
      // 断言
      expect(mockNoteService.getFolders).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '未授权访问'
        })
      );
    });
  });
  
  describe('updateFolders', () => {
    it('应该更新用户的笔记目录结构', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const mockFolders: NoteTreeNode[] = [
        { 
          key: 'folder1', 
          label: '更新的文件夹', 
          type: 'folder',
          selectable: true, 
          children: [
            { key: 'note1', label: '更新的笔记', type: 'note', selectable: true }
          ]
        }
      ];
      req.body = { data: mockFolders }; // 根据控制器实现修改
      const res = mockResponse();
      
      // 模拟NoteService.updateFolders方法返回值
      mockNoteService.updateFolders.mockResolvedValue(true);
      
      // 调用控制器方法
      await noteController.updateFolders(req, res);
      
      // 断言
      expect(mockNoteService.updateFolders).toHaveBeenCalledWith(userId, mockFolders);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
    
    it('应该在用户未授权时返回401', async () => {
      // 准备没有用户信息的请求
      const req = mockRequest();
      req.user = undefined; // 未授权
      const res = mockResponse();
      
      // 调用控制器方法
      await noteController.updateFolders(req, res);
      
      // 断言
      expect(mockNoteService.updateFolders).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '未授权访问'
        })
      );
    });
  });
  
  describe('getNote', () => {
    it('应该根据ID返回笔记', async () => {
      // 准备请求和响应对象
      const noteId = randomUUID();
      const req = mockRequest();
      req.params = { id: noteId };
      const res = mockResponse();
      
      // 模拟笔记数据
      const mockNote: Note = {
        meta: {
          id: noteId,
          title: '测试笔记',
          create: new Date(),
          modified: new Date(),
          tags: ['测试']
        },
        content: '这是笔记内容'
      };
      
      // 模拟NoteService.getNoteById方法返回值
      mockNoteService.getNoteById.mockResolvedValue(mockNote);
      
      // 调用控制器方法
      await noteController.getNote(req, res);
      
      // 断言
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(noteId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockNote
        })
      );
    });
    
    it('当笔记不存在时应返回404', async () => {
      // 准备请求和响应对象
      const noteId = randomUUID();
      const req = mockRequest();
      req.params = { id: noteId };
      const res = mockResponse();
      
      // 模拟NoteService.getNoteById方法返回null
      mockNoteService.getNoteById.mockResolvedValue(null);
      
      // 调用控制器方法
      await noteController.getNote(req, res);
      
      // 断言
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(noteId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '笔记不存在'
        })
      );
    });
  });
  
  describe('createNote', () => {
    it('应该创建新笔记', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const noteMeta: NoteMeta = {
        id: randomUUID(),
        title: '新笔记',
        create: new Date(),
        modified: new Date()
      };
      req.body = noteMeta;
      const res = mockResponse();
      
      // 模拟NoteService.createNote方法返回值
      mockNoteService.createNote.mockResolvedValue(true);
      
      // 调用控制器方法
      await noteController.createNote(req, res);
      
      // 断言
      expect(mockNoteService.createNote).toHaveBeenCalledWith(userId, noteMeta);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
    
    it('应该在用户未授权时返回401', async () => {
      // 准备没有用户信息的请求
      const req = mockRequest();
      req.user = undefined; // 未授权
      const res = mockResponse();
      
      // 调用控制器方法
      await noteController.createNote(req, res);
      
      // 断言
      expect(mockNoteService.createNote).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '未授权访问'
        })
      );
    });
    
    it('应该在缺少笔记元数据时返回400', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      req.body = {}; // 缺少笔记元数据
      const res = mockResponse();
      
      // 调用控制器方法
      await noteController.createNote(req, res);
      
      // 断言
      expect(mockNoteService.createNote).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '笔记标题不能为空' // 根据控制器实际实现修改
        })
      );
    });
  });
  
  describe('updateNote', () => {
    it('应该更新笔记', async () => {
      // 准备请求和响应对象
      const noteId = randomUUID();
      const req = mockRequest();
      req.params = { id: noteId };
      const note: Note = {
        meta: {
          id: noteId,
          title: '更新的笔记',
          create: new Date(),
          modified: new Date()
        },
        content: '更新的内容'
      };
      req.body = note;
      const res = mockResponse();
      
      // 模拟NoteService.getNoteById方法返回值（笔记存在）
      mockNoteService.getNoteById.mockResolvedValue({
        meta: { id: noteId, title: '原标题', create: new Date(), modified: new Date() },
        content: '原内容'
      });
      
      // 模拟NoteService.updateNote方法返回值
      mockNoteService.updateNote.mockResolvedValue(true);
      
      // 调用控制器方法
      await noteController.updateNote(req, res);
      
      // 断言
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(noteId);
      expect(mockNoteService.updateNote).toHaveBeenCalledWith(note);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
    
    it('当笔记不存在时应返回404', async () => {
      // 准备请求和响应对象
      const noteId = randomUUID();
      const req = mockRequest();
      const note: Note = {
        meta: {
          id: noteId,
          title: '不存在的笔记',
          create: new Date(),
          modified: new Date()
        },
        content: '内容'
      };
      req.body = note;
      const res = mockResponse();
      
      // 模拟NoteService.getNoteById方法返回null（笔记不存在）
      mockNoteService.getNoteById.mockResolvedValue(null);
      
      // 调用控制器方法
      await noteController.updateNote(req, res);
      
      // 断言
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(noteId);
      expect(mockNoteService.updateNote).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '笔记不存在'
        })
      );
    });
  });
  
  describe('deleteNote', () => {
    it('应该删除笔记', async () => {
      // 准备请求和响应对象
      const noteId = randomUUID();
      const req = mockRequest();
      req.params = { id: noteId };
      const res = mockResponse();
      
      // 模拟NoteService.getNoteById方法返回值（笔记存在）
      mockNoteService.getNoteById.mockResolvedValue({
        meta: { id: noteId, title: '要删除的笔记', create: new Date(), modified: new Date() },
        content: '笔记内容'
      });
      
      // 模拟NoteService.deleteNote方法返回值
      mockNoteService.deleteNote.mockResolvedValue(true);
      
      // 调用控制器方法
      await noteController.deleteNote(req, res);
      
      // 断言
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(noteId);
      expect(mockNoteService.deleteNote).toHaveBeenCalledWith(noteId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
    
    it('当笔记不存在时应返回404', async () => {
      // 准备请求和响应对象
      const noteId = randomUUID();
      const req = mockRequest();
      req.params = { id: noteId };
      const res = mockResponse();
      
      // 模拟NoteService.getNoteById方法返回null（笔记不存在）
      mockNoteService.getNoteById.mockResolvedValue(null);
      
      // 调用控制器方法
      await noteController.deleteNote(req, res);
      
      // 断言
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(noteId);
      expect(mockNoteService.deleteNote).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '笔记不存在'
        })
      );
    });
  });
});
