import { TodoRawData } from "@server/types/db";
import { Todo, TodoCreateData, TodoStatus } from "@server/types/todo";
import { TodoTags } from "@server/types/gerneral";

/**
 * 将数据库原始数据转换为 TodoCreateData 对象
 * @param todo 数据库原始数据
 * @returns 转换后的 TodoCreateData 对象
 */
export function dbToTodo(todo: TodoRawData): TodoCreateData {
  try {
    // 基本验证
    if (!validateTodoRawData(todo)) {
      throw new Error(`Invalid todo data: ${JSON.stringify(todo)}`);
    }

    // 安全解析标签
    const parsedTags = safeJsonParse<TodoTags | undefined>(todo.tags, undefined);

    // 验证解析后的标签是否为数组
    if (parsedTags !== undefined && !Array.isArray(parsedTags)) {
      console.warn(`Invalid tags format for todo ${todo.id}, expected array but got:`, parsedTags);
    }

    // 验证并转换日期
    const createdAt = todo.created_at;
    if (isNaN(new Date(todo.created_at).getTime())) {
      throw new Error(`Invalid created_at date for todo ${todo.id}: ${todo.created_at}`);
    }

    let ddl: Date | undefined;
    if (todo.ddl) {
      ddl = new Date(todo.ddl);
      if (isNaN(ddl.getTime())) {
        console.warn(`Invalid ddl date for todo ${todo.id}: ${todo.ddl}`);
        ddl = undefined;
      }
    }

    // 验证完成状态
    const validStatuses: TodoStatus['completed'][] = ['completed', 'in-progress', 'not-started', 'pending'];
    const completedStatus = validStatuses.includes(todo.completed) ? todo.completed : 'not-started';

    if (!validStatuses.includes(todo.completed)) {
      console.warn(`Invalid completion status for todo ${todo.id}: ${todo.completed}, defaulting to 'not-started'`);
    }

    // 验证优先级
    const priority = typeof todo.priority === 'number' && todo.priority >= 0 ? todo.priority : 0;
    if (priority !== todo.priority) {
      console.warn(`Invalid priority for todo ${todo.id}: ${todo.priority}, defaulting to 0`);
    }

    return {
      info: {
        id: todo.id,
        title: todo.title,
        description: todo.description || undefined,
        create: new Date(createdAt),
        priority: priority,
        ddl: ddl,
        tags: Array.isArray(parsedTags) ? parsedTags : undefined,
        note_link: todo.note_link || undefined,
      },
      status: {
        completed: completedStatus,
      },
      user_id: todo.user_id,
    };
  } catch (error) {
    console.error(`Error converting todo ${todo.id} from database:`, error);
    throw error;
  }
}

/**
 * 将 TodoCreateData 对象转换为适合插入数据库的格式
 * @param todo TodoCreateData 对象
 * @returns 适合数据库操作的数据对象
 */
export function todoToDb(todo: TodoCreateData) {
  return {
    id: todo.info.id,
    user_id: todo.user_id,
    title: todo.info.title,
    description: todo.info.description,
    created_at: todo.info.create.toISOString(),
    ddl: todo.info.ddl?.toISOString(),
    priority: todo.info.priority,
    tags: todo.info.tags ? JSON.stringify(todo.info.tags) : undefined,
    note_link: todo.info.note_link,
    completed: todo.status.completed,
  };
}

/**
 * 验证 TodoRawData 对象的基本完整性
 * @param todo 数据库原始数据
 * @returns 是否通过验证
 */
export function validateTodoRawData(todo: TodoRawData): boolean {
  if (!todo.id || typeof todo.id !== 'string') {
    console.error('Invalid todo: missing or invalid id');
    return false;
  }

  if (!todo.user_id || typeof todo.user_id !== 'string') {
    console.error(`Invalid todo ${todo.id}: missing or invalid user_id`);
    return false;
  }

  if (!todo.title || typeof todo.title !== 'string') {
    console.error(`Invalid todo ${todo.id}: missing or invalid title`);
    return false;
  }

  if (!todo.created_at || typeof todo.created_at !== 'string') {
    console.error(`Invalid todo ${todo.id}: missing or invalid created_at`);
    return false;
  }

  return true;
}

/**
 * 批量转换数据库原始数据为 TodoCreateData 对象
 * @param todos 数据库原始数据数组
 * @returns 转换后的 TodoCreateData 对象数组，过滤掉无效数据
 */
export function batchDbToTodo(todos: TodoRawData[]): TodoCreateData[] {
  const validTodos: TodoCreateData[] = [];

  for (const todo of todos) {
    try {
      if (validateTodoRawData(todo)) {
        validTodos.push(dbToTodo(todo));
      }
    } catch (error) {
      console.error(`Failed to convert todo ${todo.id}:`, error);
      // 继续处理其他 todos，不中断整个批量转换
    }
  }

  return validTodos;
}

/**
 * 安全地解析 JSON 字符串
 * @param jsonString JSON 字符串
 * @param fallback 解析失败时的备用值
 * @returns 解析结果或备用值
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON string:', jsonString, error);
    return fallback;
  }
}