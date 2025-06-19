import { COOKIE_NAMES, getCookie } from '../auth/cookie';
import type { Todo } from '../types/todo';

// API 响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

interface TodoListResponse {
  success: boolean;
  data: Todo[];
  message: string;
}

interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  category?: string;
}

interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  category?: string;
}

// TODO操作API
export const todoOps = {
  /**
   * 获取用户的所有TODO
   */
  getTodos: async (): Promise<TodoListResponse> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    const response = await fetch('/api/todos', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('获取TODO列表失败:', error);
      return { status: 500, ok: false } as unknown as Response;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      return { success: false, data: [], message: errorData.message || '获取TODO列表失败' };
    }

    return await response.json();
  },

  /**
   * 创建新的TODO
   */
  createTodo: async (todoData: CreateTodoRequest): Promise<ApiResponse<Todo>> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    }).catch(error => {
      console.error('创建TODO失败:', error);
      return { status: 500, ok: false } as unknown as Response;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      return { success: false, message: errorData.message || '创建TODO失败' };
    }

    return await response.json();
  },
  /**
   * 更新TODO
   */
  updateTodo: async (id: number | string, todoData: UpdateTodoRequest): Promise<ApiResponse<Todo>> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    }).catch(error => {
      console.error('更新TODO失败:', error);
      return { status: 500, ok: false } as unknown as Response;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      return { success: false, message: errorData.message || '更新TODO失败' };
    }

    return await response.json();
  },
  /**
   * 删除TODO
   */
  deleteTodo: async (id: number | string): Promise<ApiResponse<void>> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('删除TODO失败:', error);
      return { status: 500, ok: false } as unknown as Response;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      return { success: false, message: errorData.message || '删除TODO失败' };
    }

    return await response.json();
  },
  /**
   * 切换TODO完成状态
   */
  toggleTodo: async (id: number | string): Promise<ApiResponse<Todo>> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    const response = await fetch(`/api/todos/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('切换TODO状态失败:', error);
      return { status: 500, ok: false } as unknown as Response;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      return { success: false, message: errorData.message || '切换TODO状态失败' };
    }

    return await response.json();
  },

  /**
   * 获取已完成的TODO
   */
  getCompletedTodos: async (): Promise<TodoListResponse> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    const response = await fetch('/api/todos/completed', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('获取已完成TODO失败:', error);
      return { status: 500, ok: false } as unknown as Response;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      return { success: false, data: [], message: errorData.message || '获取已完成TODO失败' };
    }

    return await response.json();
  },

  /**
   * 获取未完成的TODO
   */
  getPendingTodos: async (): Promise<TodoListResponse> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    const response = await fetch('/api/todos/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('获取未完成TODO失败:', error);
      return { status: 500, ok: false } as unknown as Response;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      return { success: false, data: [], message: errorData.message || '获取未完成TODO失败' };
    }

    return await response.json();
  },

  /**
   * 按分类获取TODO
   */
  getTodosByCategory: async (category: string): Promise<TodoListResponse> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    const response = await fetch(`/api/todos/category/${category}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('获取分类TODO失败:', error);
      return { status: 500, ok: false } as unknown as Response;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      return { success: false, data: [], message: errorData.message || '获取分类TODO失败' };
    }

    return await response.json();
  },
};