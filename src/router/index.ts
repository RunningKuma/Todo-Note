import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";

import HomeView from '@/screens/Home/HomeView.vue';
import LoginView from '@/screens/Login/LoginView.vue';
import { userOps } from "@/api/auth";
import Overview from "@/screens/Home/Overview/Overview.vue";
import Search from "@/screens/Home/Search/Search.vue";

const routes: readonly RouteRecordRaw[] = [
  {
    path: '/', name: 'home', component: HomeView, children: [
      {
        path: '',
        name: 'overview',
        component: Overview
      },
      {
        path: 'search',
        name: 'search',
        component: Search
      },
    ]
  },
  { path: '/auth', name: 'auth', component: LoginView },
];
const router = createRouter({
  history: createMemoryHistory(),
  routes: routes
});
router.beforeEach(async (to, from, next) => {
  // next({ name: 'auth' });
  const isAuthenticated = await userOps.manualCheckAuth();
  // console.log(userOps.getUserData());
  if (isAuthenticated || to.name === 'auth') {
    next();
  } else {
    console.warn('用户未认证，重定向到登录页面');
    next({ name: 'auth' });
  }
});
export default router;