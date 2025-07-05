
import { TodoData } from '../models/todo';
import { Todo } from './todo';

export type UserData_Old = {
	id: string,
	email: string,
	username: string,
	// roles: 'admin' | 'user',
	// token: string | null,
	todo: TodoData[]
}

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