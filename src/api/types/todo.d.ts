export type Todo = {
	id: number;
	user_id: string;
	title: string;
	description?: string;
	completed: boolean;
	priority: 'low' | 'medium' | 'high';
	due_date?: string;
	category?: string;
	created_at: string;
	updated_at: string;
	// 为了兼容前端，添加别名字段
	createdAt: Date;
	updatedAt: Date;
	dueDate?: Date;
}