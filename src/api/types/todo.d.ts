//@todo to inplement
export type Todo = {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
	dueDate?: Date;
	priority?: 'low' | 'medium' | 'high'; // optional priority level
}