import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";

import HomeView from '@/screens/Home/index.vue';
import LoginView from '@/screens/Login/index.vue';
import { userOps } from "@/api/auth";

const routes: readonly RouteRecordRaw[] = [
	{ path: '/', name: 'home', component: HomeView },
	{ path: '/auth', name: 'auth', component: LoginView },
]
const router = createRouter({
	history: createMemoryHistory(),
	routes: routes
})
router.beforeEach((to, from, next) => {
	// next({ name: 'auth' });
	const isAuthenticated = userOps.checkAuth();
	// console.log(userOps.getUserData());
	if (isAuthenticated || to.name === 'auth') {
		next();
	} else {
		console.warn('用户未认证，重定向到登录页面');
		next({ name: 'auth' });
	}
})
export default router;