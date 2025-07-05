import type { Todo } from "./todo";

export type UserInfo = {
	id: string,
	email: string,
	username: string,
	// roles: 'admin' | 'user',
}
export type UserStore = {
	todo: Todo[]
}
export type UserData = {
	info: UserInfo,
	Store: UserStore
}