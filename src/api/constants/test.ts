import type { UserData } from "../types/user";

export const testUserData: UserData = {

  id: "c3fea732-28d2-4320-8e32-a6c89314e8fd",
  email: "test@test.com",
  username: "test-user",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMzZmVhNzMyLTI4ZDItNDMyMC04ZTMyLWE2Yzg5MzE0ZThmZCIsImlhdCI6MTc1MDE3MjE5MiwiZXhwIjoxNzUwMTc1NzkyfQ.9LvxXnoAEcjT6YBvsSYcjNNT-s0rADg-PJgo7_kZpIo",
  todo: [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'This is a test todo item.',
      completed: false,
      createdAt: new Date('2025-06-05T10:00:00Z'),
      updatedAt: new Date('2025-06-05T10:00:00Z'),
      dueDate: new Date('2025-06-6T00:00:00Z'),
      priority: 'medium'
    },
    {
      id: '2',
      title: 'Test Todo 2',
      description: 'This is another test todo item.',
      completed: true,
      createdAt: new Date('2025-06-05T00:00:00Z'),
      updatedAt: new Date('2025-06-05T00:00:00Z'),
      dueDate: new Date('2025-06-11T00:00:00Z'),
      priority: 'high'
    }
  ]
};