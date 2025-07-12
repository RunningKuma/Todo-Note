import { NoteId, TodoId, TodoTags } from "./gerneral";

export type Todo_Old = {
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

export type TodoInfo = {
	id: TodoId,
	title: string,
	description?: string,
	create: Date,
	ddl?: Date,
	priority: number,
	tags?: TodoTags,
	note_link?: NoteId
}
export type TodoInfoTrans = Omit<TodoInfo, 'create' | 'ddl' | 'tags'> & {
	create: string,
	ddl?: string,
}
export type TodoStatus = { completed: 'completed' | 'in-progress' | 'not-started' | 'pending' }

export type TodoTrans = {
	info: TodoInfoTrans
	status: TodoStatus;
}
export type Todo = {
	info: TodoInfo
	status: TodoStatus;
}

export type TodoCreateData = Omit<TodoInfo, 'id' | 'create'>