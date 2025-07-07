import { TodoTags } from "./gerneral";

//@todo to inplement
export type Todo_Old = {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
	dueDate?: Date;
	priority?: 'low' | 'medium' | 'high'; // optional priority level
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
export type TodoStatus = { completed: 'completed' | 'in-progress' | 'not-started' | 'pending' }

export type Todo = {
	info: TodoInfo
	status: TodoStatus;
}

export type TodoCreateData = Omit<TodoInfo, 'id' | 'create'>