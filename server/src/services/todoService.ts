import { Todo as TodoType } from '@server/types/todo';
import { Todo, TodoType } from '../models/todo';

export class TodoService {
  constructor() {
    // 初始化TODO表
    Todo.createTable();
  }

  /**
   * 创建新的TODO
   */
  async createTodo(todoData: TodoType): Promise<TodoType> {
    return await Todo.create(todoData);
  }

  /**
   * 获取用户的所有TODO
   */
  async getUserTodos(userId: string) {
    return await Todo.findByUserId(userId);
  }

  // /**
  //  * 根据ID获取TODO
  //  */
  // async getTodoById(id: number) {
  //   return await Todo.findById(id);
  // }

  /**
   * 更新TODO
   */
  async updateTodo(id: number, todoData: TodoType) {
    return await Todo.update(id, todoData);
  }

  /**
   * 删除TODO
   */
  async deleteTodo(id: number) {
    return await Todo.delete(id);
  }

  /**
   * 切换TODO完成状态
   */
  async toggleTodoCompleted(id: number) {
    return await Todo.toggleCompleted(id);
  }

  // /**
  //  * 获取已完成的TODO
  //  */
  // async getCompletedTodos(userId: string): Promise<TodoData[]> {
  //   return await Todo.findCompleted(userId);
  // }

  // /**
  //  * 获取未完成的TODO
  //  */
  // async getPendingTodos(userId: string): Promise<TodoData[]> {
  //   return await Todo.findPending(userId);
  // }

  // /**
  //  * 按分类获取TODO
  //  */
  // async getTodosByCategory(userId: string, category: string): Promise<TodoData[]> {
  //   return await Todo.findByCategory(userId, category);
  // }
}
