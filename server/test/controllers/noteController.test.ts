// test/controllers/noteController.test.ts

import { NoteController } from '@server/controllers/noteController';
import { Response } from 'express';
import { AuthenticatedRequest } from '@server/middleware/auth';
import { randomUUID } from 'crypto';
import { NoteClass } from '@server/models/note';
import { Note, NoteMeta, NoteTreeNode } from '@server/types/note';


// 模拟NoteService
jest.mock('@server/services/noteService', () => {
  return {
    NoteService: jest.fn().mockImplementation(() => {
      return {};
    })
  };
});

// 模拟NoteClass
jest.mock('@server/models/note', () => {
  return {
    NoteClass: {
      createTable: jest.fn(),
      getFolders: jest.fn(),
      updateFolders: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
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
      
      // 模拟NoteClass.getFolders方法返回值
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
      (NoteClass.getFolders as jest.Mock).mockResolvedValue(mockFolders);
      
      // 调用控制器方法
      await noteController.getFolders(req, res);
      
      // 断言
      expect(NoteClass.getFolders).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockFolders
        })
      );
    });
    
    it('当用户未认证时应返回401', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = undefined; // 未认证
      const res = mockResponse();
      
      // 调用控制器方法
      await noteController.getFolders(req, res);
      
      // 断言
      expect(NoteClass.getFolders).not.toHaveBeenCalled();
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
      const res = mockResponse();
      
      // 模拟请求体
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
      req.body = { data: mockFolders };
      
      // 模拟NoteClass.updateFolders方法返回值
      (NoteClass.updateFolders as jest.Mock).mockResolvedValue(true);
      
      // 调用控制器方法
      await noteController.updateFolders(req, res);
      
      // 断言
      expect(NoteClass.updateFolders).toHaveBeenCalledWith(userId, mockFolders);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
    
    it('当缺少数据时应返回400', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 模拟请求体 - 缺少data字段
      req.body = {};
      
      // 调用控制器方法
      await noteController.updateFolders(req, res);
      
      // 断言
      expect(NoteClass.updateFolders).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '请提供笔记目录结构数据'
        })
      );
    });
  });
  
  describe('getNote', () => {
    it('应该根据ID返回笔记', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      const res = mockResponse();
      
      // 模拟请求参数
      const noteId = randomUUID();
      req.params = { id: noteId };
      
      // 模拟NoteClass.findById方法返回值
      const mockNote: Note = {
        meta: {
          id: noteId,
          title: '测试笔记',
          create: new Date(),
          modified: new Date()
        },
        content: '这是笔记内容'
      };
      (NoteClass.findById as jest.Mock).mockResolvedValue(mockNote);
      
      // 调用控制器方法
      await noteController.getNote(req, res);
      
      // 断言
      expect(NoteClass.findById).toHaveBeenCalledWith(noteId);
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
      const req = mockRequest();
      const res = mockResponse();
      
      // 模拟请求参数
      const noteId = randomUUID();
      req.params = { id: noteId };
      
      // 模拟NoteClass.findById方法返回null
      (NoteClass.findById as jest.Mock).mockResolvedValue(null);
      
      // 调用控制器方法
      await noteController.getNote(req, res);
      
      // 断言
      expect(NoteClass.findById).toHaveBeenCalledWith(noteId);
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
      const res = mockResponse();
      
      // 模拟请求体
      const noteId = randomUUID();
      const noteMeta: NoteMeta = {
        id: noteId,
        title: '新笔记',
        create: new Date(),
        modified: new Date()
      };
      req.body = noteMeta;
      
      // 模拟NoteClass.create方法返回值
      (NoteClass.create as jest.Mock).mockResolvedValue(true);
      
      // 调用控制器方法
      await noteController.createNote(req, res);
      
      // 断言
      expect(NoteClass.create).toHaveBeenCalledWith(userId, noteMeta);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
    
    it('当标题为空时应返回400', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 模拟请求体 - 空标题
      const noteId = randomUUID();
      const noteMeta: NoteMeta = {
        id: noteId,
        title: '',
        create: new Date(),
        modified: new Date()
      };
      req.body = noteMeta;
      
      // 调用控制器方法
      await noteController.createNote(req, res);
      
      // 断言
      expect(NoteClass.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '笔记标题不能为空'
        })
      );
    });
    
    it('当缺少ID时应返回400', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 模拟请求体 - 缺少ID
      const noteMeta = {
        title: '无ID笔记',
        create: new Date(),
        modified: new Date()
      };
      req.body = noteMeta;
      
      // 调用控制器方法
      await noteController.createNote(req, res);
      
      // 断言
      expect(NoteClass.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '请提供笔记ID'
        })
      );
    });
  });
  
  describe('updateNote', () => {
    it('应该更新笔记', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 模拟请求体
      const noteId = randomUUID();
      const note: Note = {
        meta: {
          id: noteId,
          title: '更新的笔记',
          create: new Date(),
          modified: new Date()
        },
        content: '更新的笔记内容'
      };
      req.body = note;
      
      // 模拟NoteClass.findById方法返回值 - 笔记存在
      (NoteClass.findById as jest.Mock).mockResolvedValue({
        meta: { id: noteId, title: '原笔记', create: new Date(), modified: new Date() },
        content: '原笔记内容'
      });
      
      // 模拟NoteClass.update方法返回值
      (NoteClass.update as jest.Mock).mockResolvedValue(true);
      
      // 调用控制器方法
      await noteController.updateNote(req, res);
      
      // 断言
      expect(NoteClass.findById).toHaveBeenCalledWith(noteId);
      expect(NoteClass.update).toHaveBeenCalledWith(note);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
    
    it('当笔记不存在时应返回404', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 模拟请求体
      const noteId = randomUUID();
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
      
      // 模拟NoteClass.findById方法返回值 - 笔记不存在
      (NoteClass.findById as jest.Mock).mockResolvedValue(null);
      
      // 调用控制器方法
      await noteController.updateNote(req, res);
      
      // 断言
      expect(NoteClass.findById).toHaveBeenCalledWith(noteId);
      expect(NoteClass.update).not.toHaveBeenCalled();
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
      const req = mockRequest();
      const res = mockResponse();
      
      // 模拟请求参数
      const noteId = randomUUID();
      req.params = { id: noteId };
      
      // 模拟NoteClass.findById方法返回值 - 笔记存在
      (NoteClass.findById as jest.Mock).mockResolvedValue({
        meta: { id: noteId, title: '待删除笔记', create: new Date(), modified: new Date() },
        content: '待删除内容'
      });
      
      // 模拟NoteClass.delete方法返回值
      (NoteClass.delete as jest.Mock).mockResolvedValue(true);
      
      // 调用控制器方法
      await noteController.deleteNote(req, res);
      
      // 断言
      expect(NoteClass.findById).toHaveBeenCalledWith(noteId);
      expect(NoteClass.delete).toHaveBeenCalledWith(noteId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
    
    it('当笔记不存在时应返回404', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      const res = mockResponse();
      
      // 模拟请求参数
      const noteId = randomUUID();
      req.params = { id: noteId };
      
      // 模拟NoteClass.findById方法返回值 - 笔记不存在
      (NoteClass.findById as jest.Mock).mockResolvedValue(null);
      
      // 调用控制器方法
      await noteController.deleteNote(req, res);
      
      // 断言
      expect(NoteClass.findById).toHaveBeenCalledWith(noteId);
      expect(NoteClass.delete).not.toHaveBeenCalled();
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
