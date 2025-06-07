
export type UserData = {
	id: string,
	token: string | null,
	username: string,
	// roles: 'admin' | 'user',
	todo: Todo[]
}