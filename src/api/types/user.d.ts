import type { Todo } from "./todo"

export type UserData = {
	id: string,
	token: string | null,
	username: string,
	// roles: 'admin' | 'user',
	todo: Todo[]
}