import type { UserData } from "../types/user";

export const testUserData: UserData = {
	id: '1',
	token: 'token',
	username: 'testuser',
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
}