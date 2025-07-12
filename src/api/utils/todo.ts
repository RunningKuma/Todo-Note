import { Todo, TodoCreateData, TodoTrans } from "../types/todo";

export function createEmptyTodo(): Todo | null {
  if (!window.crypto) {
    console.error('Crypto API is not supported in this environment.');
    return null;
  }
  return {
    info: {
      id: window.crypto.randomUUID(),
      title: '',
      description: '',
      create: new Date(),
      priority: 3,
      ddl: undefined,
    },
    status: {
      completed: 'not-started',
    },
  };
}
// export function createTodo(todo: TodoCreateData): Todo | null {
//   return
// }

export function todoTransToTodo(todo: TodoTrans): Todo {
  return {
    info: {
      ...todo.info,
      create: new Date(todo.info.create),
      ddl: new Date(todo.info.ddl)
    },
    status: todo.status
  }
}