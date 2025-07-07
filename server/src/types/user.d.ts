
import { TodoType } from '../models/todo';
import { UserId } from './gerneral';
import { Todo } from './todo';

export type UserData_Old = {
	id: UserId,
	email: string,
	username: string,
	// roles: 'admin' | 'user',
	// token: string | null,
	todo: TodoType[]
}

export type UserInfo = {
	id: UserId,
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