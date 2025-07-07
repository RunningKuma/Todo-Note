import { Request, Response } from 'express';
import { TodoService } from '../services/todoService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '@server/types/request';
import { Todo, TodoCreateData } from '@server/types/todo';
import { TodoId, UserId } from '@server/types/gerneral';
export interface toggleRequestBody {
  id: TodoId;
  complete: boolean;
}
export class TodoController {
  private todoService: TodoService;

  constructor() {
    this.todoService = new TodoService();
  }
  /**
   * 获取用户的所有TODO
   */
  public getTodos = async (req: AuthenticatedRequest, res: Response<ApiResponse<Todo[]>>): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const todos = await this.todoService.getUserTodos(userId);
      res.status(200).json({
        success: true,
        data: todos,
        message: '获取TODO列表成功'
      });
    } catch (error) {
      console.error('Error getting todos:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * 创建新的TODO
   */
  public createTodo = async (req: AuthenticatedRequest, res: Response<ApiResponse<number>>): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { title } = (req.body as Todo).info;


      // @todo other check
      if (!title || title.trim() === '') {
        res.status(400).json({ success: false, message: 'TODO标题不能为空' });
        return;
      }

      const todoData: TodoCreateData = {
        user_id: userId,
        ...req.body as Todo
      };

      const response = await this.todoService.createTodo(todoData);
      res.status(201).json({
        success: true,
        data: response,
        message: 'TODO创建成功'
      });
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 更新TODO
   */
  public updateTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { id } = (req.body as Todo).info;

      // 验证 TODO 访问权限
      const hasAccess = await this.validateTodoAccess(id, userId, res);
      if (!hasAccess) {
        return;
      }

      const response = await this.todoService.updateTodo({ user_id: userId, ...req.body as Todo });
      res.status(200).json({
        success: true,
        data: response,
        message: 'TODO更新成功'
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({
        success: false,
        message: '更新TODO失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 删除TODO
   */
  public deleteTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { id } = (req.body as Todo).info;

      // 验证 TODO 访问权限
      const hasAccess = await this.validateTodoAccess(id, userId, res);
      if (!hasAccess) {
        return;
      }

      await this.todoService.deleteTodo(id);
      res.status(200).json({
        success: true,
        message: 'TODO删除成功'
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({
        success: false,
        message: '删除TODO失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 切换TODO完成状态
   */

  public toggleTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: '未授权访问' });
        return;
      }

      const { id, complete } = req.body as toggleRequestBody;

      // 验证 TODO 访问权限
      const hasAccess = await this.validateTodoAccess(id, userId, res);
      if (!hasAccess) {
        return;
      }

      const updatedTodo = await this.todoService.toggleTodoCompleted(id, complete);
      res.status(200).json({
        success: true,
        data: updatedTodo,
        message: 'TODO状态更新成功'
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
      res.status(500).json({
        success: false,
        message: '更新TODO状态失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * 验证 Todo 修改权限
   */
  private async validateTodoAccess(todoId: TodoId, userId: UserId, res: Response): Promise<boolean> {
    if (!todoId) {
      res.status(400).json({ success: false, message: '无效的TODO ID' });
      return false;
    }

    // 检查TODO是否存在且属于当前用户
    const existingTodo = await this.todoService.getTodoById(todoId);
    if (!existingTodo) {
      res.status(404).json({ success: false, message: 'TODO不存在' });
      return false;
    }

    if (existingTodo.user_id !== userId) {
      res.status(403).json({ success: false, message: '无权限访问此TODO' });
      return false;
    }

    return true;
  }

  /**
   * 获取已完成的TODO
   */
  // public getCompletedTodos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //   try {
  //     const userId = req.user?.id;
  //     if (!userId) {
  //       res.status(401).json({ success: false, message: '未授权访问' });
  //       return;
  //     }

  //     const todos = await this.todoService.getCompletedTodos(userId);
  //     res.status(200).json({
  //       success: true,
  //       data: todos,
  //       message: '获取已完成TODO成功'
  //     });
  //   } catch (error) {
  //     console.error('Error getting completed todos:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: '获取已完成TODO失败',
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     });
  //   }
  // };

  // /**
  //  * 获取未完成的TODO
  //  */
  // public getPendingTodos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //   try {
  //     const userId = req.user?.id;
  //     if (!userId) {
  //       res.status(401).json({ success: false, message: '未授权访问' });
  //       return;
  //     }

  //     const todos = await this.todoService.getPendingTodos(userId);
  //     res.status(200).json({
  //       success: true,
  //       data: todos,
  //       message: '获取未完成TODO成功'
  //     });
  //   } catch (error) {
  //     console.error('Error getting pending todos:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: '获取未完成TODO失败',
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     });
  //   }
  // };

  // /**
  //  * 按分类获取TODO
  //  */
  // public getTodosByCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //   try {
  //     const userId = req.user?.id;
  //     if (!userId) {
  //       res.status(401).json({ success: false, message: '未授权访问' });
  //       return;
  //     }

  //     const { category } = req.params;
  //     if (!category) {
  //       res.status(400).json({ success: false, message: '分类名称不能为空' });
  //       return;
  //     }

  //     const todos = await this.todoService.getTodosByCategory(userId, category);
  //     res.status(200).json({
  //       success: true,
  //       data: todos,
  //       message: `获取分类"${category}"的TODO成功`
  //     });
  //   } catch (error) {
  //     console.error('Error getting todos by category:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: '获取分类TODO失败',
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     });
  //   }
  // };
}
