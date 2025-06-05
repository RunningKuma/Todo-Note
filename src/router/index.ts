import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";

import LoginView from '@/screens/Login.vue';

const routes: readonly RouteRecordRaw[] = [
	{ path: '/login', name: 'login', component: LoginView },
]
export const router = createRouter({
	history: createMemoryHistory(),
	routes: routes
})