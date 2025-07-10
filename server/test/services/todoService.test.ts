// test/services/todoService.test.ts

import { TodoService } from '@server/services/todoService';
import { UserService } from '@server/services/userService';
import { TodoCreateData } from '@server/types/todo';
import { randomUUID } from 'crypto';

describe('TodoService', () => {
  let todoService: TodoService;
  let userService: UserService;
  let userId: string;

  // 测试前准备工作：创建一个用户
  beforeEach(async () => {
    userService = new UserService();
    todoService = new TodoService();

    // 创建测试用户
    const user = await userService.createUser(
      'todo-test@example.com',
      'todo-test-user',
      'password123'
    );
    userId = user!.id;
  });

  // 创建待办事项的测试数据
  const createTestTodo = (): TodoCreateData => ({
    info: {
      id: randomUUID(),
      title: '测试待办事项',
      description: '这是一个测试描述',
      create: new Date(),
      ddl: new Date(Date.now() + 86400000), // 明天的截止日期
      priority: 1,
      tags: ['测试', '工作'],
      note_link: undefined
    },
    status: {
      completed: 'not-started'
    },
    user_id: userId
  });

  describe('createTodo', () => {
    it('应该创建一个新的待办事项', async () => {
      const todoData = createTestTodo();
      
      // 创建待办事项
      const result = await todoService.createTodo(todoData);
      
      // 断言 - createTodo 返回 AffectNumber (number)
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      
      // 验证创建成功 - 通过查询验证
      const createdTodo = await todoService.getTodoById(todoData.info.id);
      expect(createdTodo).not.toBeNull();
      expect(createdTodo!.info.title).toBe(todoData.info.title);
      expect(createdTodo!.info.description).toBe(todoData.info.description);
      expect(createdTodo!.status.completed).toBe('not-started');
    });
  });

  describe('getUserTodos', () => {
    it('应该获取用户的所有待办事项', async () => {
      // 创建3个待办事项
      await todoService.createTodo(createTestTodo());
      await todoService.createTodo({
        ...createTestTodo(),
        info: {
          ...createTestTodo().info,
          id: randomUUID(),
          title: '第二个待办事项'
        }
      });
      await todoService.createTodo({
        ...createTestTodo(),
        info: {
          ...createTestTodo().info,
          id: randomUUID(),
          title: '第三个待办事项'
        }
      });
      
      // 获取用户的所有待办事项
      const todos = await todoService.getUserTodos(userId);
      
      // 断言
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBe(3);
      expect(todos[0].user_id).toBe(userId);
    });
    
    it('应该返回空数组当用户没有待办事项时', async () => {
      // 使用一个不存在的用户ID
      const nonExistentUserId = 'non-existent-user-id';
      
      // 获取用户的所有待办事项
      const todos = await todoService.getUserTodos(nonExistentUserId);
      
      // 断言
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBe(0);
    });
  });

  describe('getTodoById', () => {
    it('应该通过ID获取待办事项', async () => {
      // 创建待办事项
      const todoData = createTestTodo();
      await todoService.createTodo(todoData);
      
      // 通过ID获取待办事项
      const todo = await todoService.getTodoById(todoData.info.id);
      
      // 断言
      expect(todo).not.toBeNull();
      expect(todo!.info.id).toBe(todoData.info.id);
      expect(todo!.info.title).toBe(todoData.info.title);
    });
    
    it('当待办事项不存在时应返回null', async () => {
      const result = await todoService.getTodoById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateTodo', () => {
    it('应该更新待办事项', async () => {
      // 创建待办事项
      const todoData = createTestTodo();
      await todoService.createTodo(todoData);
      
      // 更新待办事项
      const updatedData: Partial<TodoCreateData> = {
        info: {
          id: todoData.info.id,
          title: '已更新的标题',
          description: '已更新的描述',
          create: todoData.info.create,
          priority: todoData.info.priority
        },
        status: {
          completed: 'in-progress'
        }
      };
      
      const updateResult = await todoService.updateTodo(updatedData);
      expect(typeof updateResult).toBe('number');
      expect(updateResult).toBeGreaterThan(0);
      
      // 获取更新后的待办事项
      const updatedTodo = await todoService.getTodoById(todoData.info.id);
      
      // 断言
      expect(updatedTodo).not.toBeNull();
      expect(updatedTodo!.info.title).toBe('已更新的标题');
      expect(updatedTodo!.info.description).toBe('已更新的描述');
      expect(updatedTodo!.status.completed).toBe('in-progress');
    });
  });

  describe('deleteTodo', () => {
    it('应该删除待办事项', async () => {
      // 创建待办事项
      const todoData = createTestTodo();
      await todoService.createTodo(todoData);
      
      // 删除待办事项
      const deleteResult = await todoService.deleteTodo(todoData.info.id);
      expect(deleteResult).toBe(true);
      
      // 尝试获取已删除的待办事项
      const deletedTodo = await todoService.getTodoById(todoData.info.id);
      
      // 断言
      expect(deletedTodo).toBeNull();
    });
  });

  describe('toggleTodoCompleted', () => {
    it('应该切换待办事项的完成状态', async () => {
      // 创建待办事项（默认未完成）
      const todoData = createTestTodo();
      await todoService.createTodo(todoData);
      
      // 切换为已完成
      const toggleResult1 = await todoService.toggleTodoCompleted(todoData.info.id, true);
      expect(toggleResult1).toBe(true);
      
      // 获取更新后的待办事项
      let updatedTodo = await todoService.getTodoById(todoData.info.id);
      
      // 断言
      expect(updatedTodo).not.toBeNull();
      expect(updatedTodo!.status.completed).toBe('completed');
      
      // 再切换回未完成
      const toggleResult2 = await todoService.toggleTodoCompleted(todoData.info.id, false);
      expect(toggleResult2).toBe(true);
      
      // 获取再次更新后的待办事项
      updatedTodo = await todoService.getTodoById(todoData.info.id);
      
      // 断言
      expect(updatedTodo!.status.completed).toBe('not-started');
    });
  });
});
