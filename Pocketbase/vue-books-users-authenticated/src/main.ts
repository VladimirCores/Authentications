import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from "vue-router";
import PocketBase from 'pocketbase';

import './style.css'

import App from './App.vue'

import UserLoginPage from "./pages/UserLoginPage.vue";
import UserRegisterPage from "./pages/UserRegisterPage.vue";
import BooksListPage from "./pages/BooksListPage.vue";

const pb = new PocketBase('http://127.0.0.1:8090');
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: BooksListPage },
    { path: '/login', component: UserLoginPage },
    { path: '/register', component: UserRegisterPage },
  ],
})
router.beforeEach((to, from, next) => {
  const authPaths = ['/login', '/register']
  if (authPaths.indexOf(to.path) < 0 && !pb.authStore.isValid)
    next({ path: '/login' })
  else next()
});
const app = createApp(App);
app.provide('pb', pb);
app.use(router)
app.mount('#app');
