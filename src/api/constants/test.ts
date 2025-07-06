import { Todo } from "../types/todo";
import type { UserData } from "../types/user";

export const testTodo: Todo[] = [{
  info: {
    id: '1',
    title: 'Test Todo',
    description: 'This is a test todo item.',
    create: new Date('2025-07-06T19:00:00Z'),
    ddl: new Date('2025-07-14T00:00:00Z'),
    priority: 2,
    tags: ['test', 'todo'],
    note_link: 'example-note-1'
  },
  status: {
    completed: 'not-started'
  }
},
  {
  info: {
    id: '2',
    title: 'Another Test Todo',
    description: 'This is another test todo item.',
      create: new Date('2025-07-06T19:00:00Z'),
      ddl: new Date('2025-07-15T00:00:00Z'),
      priority: 4,
      tags: ['test', 'todo'],
      note_link: 'example-note-2'
    },
    status: {
      completed: 'completed'
    }
  }];

export const testUserData: UserData = {
  info: {
    id: "c3fea732-28d2-4320-8e32-a6c89314e8fd",
    email: "test@test.com",
    username: "test-user",
  },
  store: {
    todo: testTodo
  }
};