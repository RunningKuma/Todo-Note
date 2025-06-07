import type { Todo } from "./todo";

export type UserData = {
	id: string,
	email: string,
	username: string,
	// roles: 'admin' | 'user',
	token: string | null,
	todo: Todo[]
}