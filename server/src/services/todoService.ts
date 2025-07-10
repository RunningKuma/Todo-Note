import { TodoCreateData, Todo } from '@server/types/todo';
import { TodoModel } from '../models/todo';
import { TodoId, UserId } from '@server/types/gerneral';

export class TodoService {
  constructor() {
    // 初始化TODO表
    TodoModel.createTable();
  }

  /**
   * 创建新的TODO
   */
  async createTodo(todoData: TodoCreateData) {
    return await TodoModel.create(todoData);
  }

  /**
   * 获取用户的所有TODO
   */
  async getUserTodos(userId: UserId) {
    return await TodoModel.findByUserId(userId);
  }

  // /**
  //  * 根据ID获取TODO
  //  */
  async getTodoById(id: TodoId) {
    return await TodoModel.findById(id);
  }

  /**
   * 更新TODO
   */
  async updateTodo(todo: TodoCreateData) {
    return await TodoModel.update(todo);
  }

  /**
   * 删除TODO
   */
  async deleteTodo(id: TodoId) {
    return await TodoModel.delete(id);
  }

  /**
   * 切换TODO完成状态
   */
  async toggleTodoCompleted(id: TodoId, complete: boolean) {
    return await TodoModel.toggleCompleted(id, complete);
  }

  /**
   * 获取用户最近的TODO
   */
  async getRecentTodos(userId: UserId, limit: number = 10) {
    return await TodoModel.findRecentByUserId(userId, limit);
  }
}
