import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";

import HomeView from '@/screens/Home/HomeView.vue';
import LoginView from '@/screens/Login/LoginView.vue';
import { userOps } from "@/api/auth/auth";
import Overview from "@/screens/Home/Overview/Overview.vue";
import TodoView from "@/screens/Home/Todo/TodoView.vue";
import Note from "@/screens/Home/Note/NoteView.vue";

const routes: readonly RouteRecordRaw[] = [
  {
    path: '/', name: '_home', component: HomeView, children: [
      {
        path: '',
        name: 'home',
        component: Overview
      },
      {

        path: 'todos',
        name: 'todos',
        component: TodoView
      },
      {
        path: 'note',
        name: 'note',
        component: Note,
        children: [
          {
            path: ':id',
            name: 'note-detail',
            component: Note,
            props: true
          },
        ]
      },
    ]
  },
  { path: '/auth', name: 'auth', component: LoginView },
];
const router = createRouter({
  history: createMemoryHistory(),
  routes: routes
});
// router.beforeEach(async (to, _from, next) => {
//   // next({ name: 'auth' });
//   const isAuthenticated = await userOps.manualCheckAuth();
//   // console.log(userOps.getUserData());
//   if (isAuthenticated || to.name === 'auth') {
//     next();
//   } else {
//     console.warn('用户未认证，重定向到登录页面');
//     next({ name: 'auth' });
//   }
// });
export default router;