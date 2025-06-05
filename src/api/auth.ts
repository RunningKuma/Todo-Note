import { testUserData } from "./constants/test"
import type { UserData } from "./types/user"

var isAuthenticated: boolean
var userData: UserData | undefined

export const userOps = {
	checkAuth: () => {
		//@todo 换成使用 token 判断
		userData = userOps.getUserData()
		return userData !== undefined // && isAuthenticated === true
	},
	getUserData: () => {
		if (userData === undefined) {
			const storedData = sessionStorage.getItem('userData')
			if (storedData) {
				userData = JSON.parse(storedData)
				isAuthenticated = true
			}
			else {
				userData = undefined
				isAuthenticated = false
				//@todo use toast instead
				console.warn('无法在本地找到用户数据，请检查登录状态.')
			}
		}
		return userData
	},
	login: () => {
		//@todo implement real login logic
		userData = testUserData
		isAuthenticated = true
		sessionStorage.setItem('userData', JSON.stringify(userData))
	},
	logout: () => {
		userData = undefined
		isAuthenticated = false
		sessionStorage.removeItem('userData')
	}
}