
import { TodoData } from '../models/todo';

export type UserData = {
	id: string,
	email: string,
	username: string,
	// roles: 'admin' | 'user',
	// token: string | null,
	todo: TodoData[]
}