// test/controllers/todoController.test.ts

import { TodoController } from '@server/controllers/todoController';
import { Response } from 'express';
import { AuthenticatedRequest } from '@server/middleware/auth';
import { randomUUID } from 'crypto';
import { TodoService } from '@server/services/todoService';
import { TodoTrans } from '@server/types/todo';
import { UserId } from '@server/types/gerneral';

// 模拟TodoService
jest.mock('@server/services/todoService');

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

describe('TodoController', () => {
  let todoController: TodoController;
  let mockTodoService: jest.Mocked<TodoService>;
  let userId: UserId;
  
  // 在每个测试前设置环境
  beforeEach(() => {
    // 创建模拟用户ID
    userId = randomUUID();
    
    // 清除并重置模拟
    jest.clearAllMocks();
    
    // 创建模拟的TodoService
    mockTodoService = new TodoService() as jest.Mocked<TodoService>;
    
    // 创建控制器实例
    todoController = new TodoController();
    // 手动替换控制器中的TodoService实例为我们的模拟
    (todoController as any).todoService = mockTodoService;
  });

  // 生成测试数据
  const createTestTodoData = (): TodoTrans => {
    const todoId = randomUUID();
    return {
      info: {
        id: todoId,
        title: '测试待办事项',
        description: '这是一个测试描述',
        create: new Date().toISOString(),
        priority: 1
      },
      status: {
        completed: 'not-started'
      }
    };
  };
  
  describe('getTodos', () => {
    it('应该返回用户的所有待办事项', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 模拟TodoService.getUserTodos的返回值
      mockTodoService.getUserTodos = jest.fn().mockResolvedValue([]);
      
      // 调用控制器方法
      await todoController.getTodos(req, res);
      
      // 断言
      expect(mockTodoService.getUserTodos).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          message: '获取TODO列表成功'
        })
      );
    });
    
    it('当用户未认证时应返回401', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = undefined; // 未认证
      const res = mockResponse();
      
      // 调用控制器方法
      await todoController.getTodos(req, res);
      
      // 断言
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '未授权访问'
        })
      );
    });
  });
  
  describe('createTodo', () => {
    it('应该创建一个新的待办事项', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 创建待办事项数据
      req.body = createTestTodoData();
      
      // 模拟TodoService.createTodo的返回值
      mockTodoService.createTodo = jest.fn().mockResolvedValue(1);
      
      // 调用控制器方法
      await todoController.createTodo(req, res);
      
      // 断言
      expect(mockTodoService.createTodo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'TODO创建成功'
        })
      );
    });
    
    it('当标题为空时应返回400', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 创建没有标题的待办事项数据
      const todoData = createTestTodoData();
      todoData.info.title = '';
      req.body = todoData;
      
      // 调用控制器方法
      await todoController.createTodo(req, res);
      
      // 断言
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'TODO标题不能为空'
        })
      );
    });
    
    it('当用户未认证时应返回401', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = undefined; // 未认证
      const res = mockResponse();
      
      // 调用控制器方法
      await todoController.createTodo(req, res);
      
      // 断言
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '未授权访问'
        })
      );
    });
  });
  
  describe('updateTodo', () => {
    it('应该更新待办事项', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 创建待办事项数据
      const todoData = createTestTodoData();
      todoData.info.title = '已更新的标题';
      todoData.info.description = '已更新的描述';
      req.body = todoData;
      
      // 模拟TodoService方法
      mockTodoService.getTodoById = jest.fn().mockResolvedValue({
        user_id: userId,
        info: { id: todoData.info.id }
      });
      mockTodoService.updateTodo = jest.fn().mockResolvedValue(1);
      
      // 调用控制器方法
      await todoController.updateTodo(req, res);
      
      // 断言
      expect(mockTodoService.getTodoById).toHaveBeenCalledWith(todoData.info.id);
      expect(mockTodoService.updateTodo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'TODO更新成功'
        })
      );
    });
  });
  
  describe('deleteTodo', () => {
    it('应该删除待办事项', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      req.user = { id: userId };
      const res = mockResponse();
      
      // 创建待办事项数据
      const todoData = createTestTodoData();
      const todoId = todoData.info.id;
      
      // 设置删除请求
      req.params = { id: todoId };
      
      // 模拟TodoService方法
      mockTodoService.getTodoById = jest.fn().mockResolvedValue({
        user_id: userId,
        info: { id: todoId }
      });
      mockTodoService.deleteTodo = jest.fn().mockResolvedValue(true);
      
      // 调用控制器方法
      await todoController.deleteTodo(req, res);
      
      // 断言
      expect(mockTodoService.getTodoById).toHaveBeenCalledWith(todoId);
      expect(mockTodoService.deleteTodo).toHaveBeenCalledWith(todoId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'TODO删除成功'
        })
      );
    });
  });
});
